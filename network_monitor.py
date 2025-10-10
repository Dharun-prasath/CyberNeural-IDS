"""
Network Packet Monitor for CyberNeural-IDS
Real-time network traffic capture and preprocessing
"""

import logging
from collections import deque
from threading import Thread, Event
import time
from typing import Dict, List, Optional, Callable
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Protocol mappings
PROTOCOL_MAP = {
    6: 'tcp',
    17: 'udp',
    1: 'icmp',
}

# Common service port mappings
SERVICE_MAP = {
    20: 'ftp_data', 21: 'ftp', 22: 'ssh', 23: 'telnet',
    25: 'smtp', 53: 'domain', 80: 'http', 110: 'pop3',
    143: 'imap', 443: 'https', 445: 'microsoft_ds',
    3306: 'mysql', 5432: 'postgresql', 6379: 'redis',
    8080: 'http_alt', 8443: 'https_alt',
}

# TCP flag mappings
TCP_FLAGS = {
    'FIN': 0x01, 'SYN': 0x02, 'RST': 0x04, 
    'PSH': 0x08, 'ACK': 0x10, 'URG': 0x20
}


class PacketFeatureExtractor:
    """Extract ML features from network packets"""
    
    def __init__(self):
        self.connection_states = {}  # Track connection states
        
    def extract_features(self, packet_data: Dict) -> Dict:
        """
        Convert raw packet data to ML model features
        
        Args:
            packet_data: Dictionary with packet information
            
        Returns:
            Dictionary with extracted features
        """
        features = {
            'protocol_type': packet_data.get('protocol', 'tcp'),
            'service': packet_data.get('service', 'other'),
            'flag': packet_data.get('flag', 'SF'),
            'src_bytes': packet_data.get('src_bytes', 0),
            'dst_bytes': packet_data.get('dst_bytes', 0),
            'duration': packet_data.get('duration', 0),
            'wrong_fragment': 0,
            'urgent': 0,
            'hot': 0,
            'num_failed_logins': 0,
            'logged_in': 0,
            'num_compromised': 0,
            'root_shell': 0,
            'su_attempted': 0,
            'num_root': 0,
            'num_file_creations': 0,
            'num_shells': 0,
            'num_access_files': 0,
            'num_outbound_cmds': 0,
            'is_host_login': 0,
            'is_guest_login': 0,
            'count': packet_data.get('count', 1),
            'srv_count': packet_data.get('srv_count', 1),
            'serror_rate': 0.0,
            'srv_serror_rate': 0.0,
            'rerror_rate': 0.0,
            'srv_rerror_rate': 0.0,
            'same_srv_rate': 1.0,
            'diff_srv_rate': 0.0,
            'srv_diff_host_rate': 0.0,
            'dst_host_count': packet_data.get('dst_host_count', 1),
            'dst_host_srv_count': packet_data.get('dst_host_srv_count', 1),
            'dst_host_same_srv_rate': 1.0,
            'dst_host_diff_srv_rate': 0.0,
            'dst_host_same_src_port_rate': 1.0,
            'dst_host_srv_diff_host_rate': 0.0,
            'dst_host_serror_rate': 0.0,
            'dst_host_srv_serror_rate': 0.0,
            'dst_host_rerror_rate': 0.0,
            'dst_host_srv_rerror_rate': 0.0,
        }
        
        return features


class NetworkMonitor:
    """Monitor and analyze live network traffic"""
    
    def __init__(self, interface: Optional[str] = None, buffer_size: int = 100):
        """
        Initialize network monitor
        
        Args:
            interface: Network interface to monitor (None = all interfaces)
            buffer_size: Number of packets to buffer before processing
        """
        self.interface = interface
        self.buffer_size = buffer_size
        self.packet_buffer = deque(maxlen=buffer_size)
        self.feature_extractor = PacketFeatureExtractor()
        
        self.is_monitoring = False
        self.monitor_thread: Optional[Thread] = None
        self.stop_event = Event()
        
        self.stats = {
            'total_packets': 0,
            'processed_packets': 0,
            'tcp_packets': 0,
            'udp_packets': 0,
            'icmp_packets': 0,
            'threats_detected': 0,
            'start_time': None,
        }
        
        self.callback: Optional[Callable] = None
        
    def set_callback(self, callback: Callable):
        """Set callback function for processed packets"""
        self.callback = callback
        
    def parse_packet_scapy(self, packet) -> Optional[Dict]:
        """
        Parse packet using Scapy
        
        Args:
            packet: Scapy packet object
            
        Returns:
            Dictionary with packet information
        """
        try:
            from scapy.all import IP, TCP, UDP, ICMP
            
            if not packet.haslayer(IP):
                return None
            
            ip_layer = packet[IP]
            packet_info = {
                'timestamp': time.time(),
                'src_ip': ip_layer.src,
                'dst_ip': ip_layer.dst,
                'protocol': PROTOCOL_MAP.get(ip_layer.proto, 'other'),
                'src_bytes': len(packet),
                'dst_bytes': 0,  # Will be calculated from bidirectional flow
                'duration': 0,
                'service': 'other',
                'flag': 'OTH',
                'src_port': 0,
                'dst_port': 0,
            }
            
            # TCP specific
            if packet.haslayer(TCP):
                tcp_layer = packet[TCP]
                packet_info['src_port'] = tcp_layer.sport
                packet_info['dst_port'] = tcp_layer.dport
                packet_info['service'] = SERVICE_MAP.get(tcp_layer.dport, 'other')
                
                # Determine TCP flags
                flags = []
                if tcp_layer.flags.F: flags.append('FIN')
                if tcp_layer.flags.S: flags.append('SYN')
                if tcp_layer.flags.R: flags.append('RST')
                if tcp_layer.flags.A: flags.append('ACK')
                
                if 'SYN' in flags and 'ACK' not in flags:
                    packet_info['flag'] = 'S0'
                elif 'SYN' in flags and 'ACK' in flags:
                    packet_info['flag'] = 'S1'
                elif 'FIN' in flags:
                    packet_info['flag'] = 'SF'
                elif 'RST' in flags:
                    packet_info['flag'] = 'REJ'
                else:
                    packet_info['flag'] = 'OTH'
                    
                self.stats['tcp_packets'] += 1
                
            # UDP specific
            elif packet.haslayer(UDP):
                udp_layer = packet[UDP]
                packet_info['src_port'] = udp_layer.sport
                packet_info['dst_port'] = udp_layer.dport
                packet_info['service'] = SERVICE_MAP.get(udp_layer.dport, 'other')
                packet_info['flag'] = 'SF'
                self.stats['udp_packets'] += 1
                
            # ICMP specific
            elif packet.haslayer(ICMP):
                packet_info['service'] = 'eco_i'
                packet_info['flag'] = 'SF'
                self.stats['icmp_packets'] += 1
            
            self.stats['total_packets'] += 1
            return packet_info
            
        except Exception as e:
            logger.error(f"Error parsing packet: {e}")
            return None
    
    def start_monitoring(self, packet_count: int = 0):
        """
        Start monitoring network traffic
        
        Args:
            packet_count: Number of packets to capture (0 = infinite)
        """
        if self.is_monitoring:
            logger.warning("Monitoring already active")
            return False
        
        try:
            from scapy.all import sniff
        except ImportError:
            logger.error("Scapy not installed. Run: pip install scapy")
            return False
        
        self.is_monitoring = True
        self.stop_event.clear()
        self.stats['start_time'] = time.time()
        
        logger.info(f"Starting network monitoring on interface: {self.interface or 'all'}")
        
        def monitor_loop():
            try:
                sniff(
                    iface=self.interface,
                    prn=self._process_packet,
                    count=packet_count,
                    store=False,
                    stop_filter=lambda x: self.stop_event.is_set()
                )
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
            finally:
                self.is_monitoring = False
                logger.info("Network monitoring stopped")
        
        self.monitor_thread = Thread(target=monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        return True
    
    def stop_monitoring(self):
        """Stop monitoring network traffic"""
        if not self.is_monitoring:
            logger.warning("Monitoring not active")
            return False
        
        logger.info("Stopping network monitoring...")
        self.stop_event.set()
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        
        self.is_monitoring = False
        return True
    
    def _process_packet(self, packet):
        """Process individual packet"""
        packet_info = self.parse_packet_scapy(packet)
        
        if packet_info:
            self.packet_buffer.append(packet_info)
            
            # Process buffer when full
            if len(self.packet_buffer) >= self.buffer_size:
                self._process_buffer()
    
    def _process_buffer(self):
        """Process buffered packets"""
        if not self.packet_buffer:
            return
        
        # Convert to features
        features_list = []
        for packet_info in self.packet_buffer:
            features = self.feature_extractor.extract_features(packet_info)
            features_list.append(features)
        
        # Create DataFrame
        df = pd.DataFrame(features_list)
        
        self.stats['processed_packets'] += len(df)
        
        # Call callback if set
        if self.callback:
            try:
                self.callback(df)
            except Exception as e:
                logger.error(f"Error in callback: {e}")
        
        # Clear buffer
        self.packet_buffer.clear()
    
    def get_stats(self) -> Dict:
        """Get monitoring statistics"""
        stats = self.stats.copy()
        if stats['start_time']:
            stats['uptime'] = time.time() - stats['start_time']
        else:
            stats['uptime'] = 0
        stats['is_monitoring'] = self.is_monitoring
        stats['buffer_size'] = len(self.packet_buffer)
        return stats
    
    def force_process_buffer(self):
        """Force processing of current buffer"""
        if self.packet_buffer:
            self._process_buffer()


# Example usage
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    def on_packets_processed(df: pd.DataFrame):
        """Callback when packets are processed"""
        print(f"Processed {len(df)} packets")
        print(df.head())
    
    monitor = NetworkMonitor(buffer_size=50)
    monitor.set_callback(on_packets_processed)
    
    print("Starting network monitoring for 60 seconds...")
    monitor.start_monitoring()
    
    try:
        time.sleep(60)
    except KeyboardInterrupt:
        print("\nStopping...")
    finally:
        monitor.stop_monitoring()
        print(f"Final stats: {monitor.get_stats()}")
