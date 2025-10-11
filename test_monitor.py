"""
Test script for network monitoring with smaller buffer size
This will show ML predictions on captured packets
"""

import time
import pandas as pd
from network_monitor import NetworkMonitor

def on_packets_processed(df: pd.DataFrame):
    """
    Callback function when packets are processed
    
    Args:
        df: DataFrame with packet features
    """
    print(f"\n{'='*60}")
    print(f"📦 Batch processed: {len(df)} packets")
    print(f"{'='*60}")
    
    # Display packet details
    for idx, row in df.iterrows():
        print(f"\nPacket {idx + 1}:")
        print(f"  Protocol: {row.get('protocol_type', 'unknown')}")
        print(f"  Service: {row.get('service', 'unknown')}")
        print(f"  Flag: {row.get('flag', 'unknown')}")
        print(f"  Src Bytes: {row.get('src_bytes', 0)}")
        print(f"  Dst Bytes: {row.get('dst_bytes', 0)}")
        print(f"  Duration: {row.get('duration', 0):.2f}s")
    
    print(f"\n{'='*60}\n")

def main():
    """Test network monitoring with small buffer"""
    
    print("🚀 Starting Network Monitoring Test")
    print("=" * 60)
    print("Configuration:")
    print("  - Interface: All")
    print("  - Buffer Size: 5 packets (small for quick testing)")
    print("  - Duration: 30 seconds")
    print("=" * 60)
    print("\n⏳ Waiting for network traffic...\n")
    
    # Create monitor with small buffer size for testing
    monitor = NetworkMonitor(interface=None, buffer_size=5)
    
    # Set callback to process packets
    monitor.set_callback(on_packets_processed)
    
    # Start monitoring
    monitor.start_monitoring(packet_count=0)  # 0 = unlimited, will stop after timeout
    
    try:
        # Monitor for 30 seconds
        time.sleep(30)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user...")
    
    # Stop monitoring
    print("\n🛑 Stopping monitoring...")
    monitor.stop_monitoring()
    
    # Force process any remaining packets in buffer
    monitor.force_process_buffer()
    
    # Get final statistics
    stats = monitor.get_stats()
    
    print("\n" + "=" * 60)
    print("📊 FINAL STATISTICS")
    print("=" * 60)
    print(f"Total Packets Captured: {stats['total_packets']}")
    print(f"Packets Processed: {stats['processed_packets']}")
    print(f"Protocol Breakdown:")
    print(f"  - TCP: {stats['tcp_packets']}")
    print(f"  - UDP: {stats['udp_packets']}")
    print(f"  - ICMP: {stats['icmp_packets']}")
    print(f"Threats Detected: {stats['threats_detected']}")
    print(f"Monitoring Duration: {stats['uptime']:.2f} seconds")
    print(f"Average Rate: {stats['total_packets'] / stats['uptime']:.2f} packets/second")
    print("=" * 60)
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    main()
