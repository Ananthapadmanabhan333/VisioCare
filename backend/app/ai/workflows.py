from typing import Dict, Any, List

class TroubleshootingWorkflowEngine:
    """
    Automated Reasoning Graph & Troubleshooting Tree Engine.
    Constructs stateful node-based flows for resolving detected diagnostics.
    """

    @classmethod
    def get_workflow_for_error(cls, error_code: str) -> Dict[str, Any]:
        """
        Builds a resolution graph representing the nodes in the troubleshooting tree.
        """
        default_nodes = [
            {"id": "init", "title": "Detect System Issue", "description": "Analyzing image OCR & diagnostics", "status": "completed"},
            {"id": "logs", "title": "Check Local Logs", "description": "Review system warning files", "status": "active"},
            {"id": "resolve", "title": "Apply Fix", "description": "Execute recommended resolutions", "status": "pending"},
            {"id": "verify", "title": "Verify Connections", "description": "Ensure endpoints respond successfully", "status": "pending"}
        ]
        
        # Specific high-fidelity trees
        if error_code == "ERR_STRIPE_GATEWAY_TIMEOUT":
            return {
                "error_code": error_code,
                "title": "Payment Integration Recovery Protocol",
                "nodes": [
                    {"id": "n1", "title": "Verify Stripe Keys", "description": "Verify secret keys in developer console", "status": "completed"},
                    {"id": "n2", "title": "Webhook Signature Check", "description": "Re-sign Stripe webhook endpoint verification header", "status": "active"},
                    {"id": "n3", "title": "Server Time Sync (NTP)", "description": "Synchronize server time to prevent clock drift rejection", "status": "pending"},
                    {"id": "n4", "title": "Increase Network Timeout", "description": "Adjust HTTP client configuration to allow 30s timeouts", "status": "pending"},
                    {"id": "n5", "title": "Complete Verification", "description": "Trigger a secure mock transaction to confirm gateway release", "status": "pending"}
                ],
                "edges": [
                    {"source": "n1", "target": "n2"},
                    {"source": "n2", "target": "n3"},
                    {"source": "n3", "target": "n4"},
                    {"source": "n4", "target": "n5"}
                ]
            }
            
        elif error_code == "ERR_DOCKER_OOM_KILLED":
            return {
                "error_code": error_code,
                "title": "Container Memory Exhaustion Recovery Flow",
                "nodes": [
                    {"id": "d1", "title": "Confirm OOM Crash", "description": "Analyze system exit code 137 under docker-compose events", "status": "completed"},
                    {"id": "d2", "title": "Inspect Resource Allocation", "description": "Review container stats and allocated memory profile", "status": "active"},
                    {"id": "d3", "title": "Analyze Code Heap Leaks", "description": "Review garbage collection flags and cache memory bloat", "status": "pending"},
                    {"id": "d4", "title": "Update Resources YAML", "description": "Scale container limits in docker-compose.yml / values.yaml to 1Gi", "status": "pending"},
                    {"id": "d5", "title": "Re-run Container", "description": "Perform clean container rebuild & resource check", "status": "pending"}
                ],
                "edges": [
                    {"source": "d1", "target": "d2"},
                    {"source": "d2", "target": "d3"},
                    {"source": "d3", "target": "d4"},
                    {"source": "d4", "target": "d5"}
                ]
            }
            
        elif error_code == "ERR_NET_IP_COLLISION":
            return {
                "error_code": error_code,
                "title": "Local Network Conflict Resolution Graph",
                "nodes": [
                    {"id": "w1", "title": "Identify MAC Conflict", "description": "Isolate conflicting MAC addresses on DHCP subnets", "status": "completed"},
                    {"id": "w2", "title": "Flush Routing Tables", "description": "Execute local network stack interface purges", "status": "active"},
                    {"id": "w3", "title": "Trigger DHCP Lease Renew", "description": "Perform DHCP release/renew to request unused IP allocation", "status": "pending"},
                    {"id": "w4", "title": "Inspect Static Blocks", "description": "Verify static IP pool boundaries on local gateways", "status": "pending"},
                    {"id": "w5", "title": "Confirm Ping Integrity", "description": "Ping diagnostic endpoints to check continuous latency", "status": "pending"}
                ],
                "edges": [
                    {"source": "w1", "target": "w2"},
                    {"source": "w2", "target": "w3"},
                    {"source": "w3", "target": "w4"},
                    {"source": "w4", "target": "w5"}
                ]
            }
            
        elif error_code == "ERR_SYSTEM_BSOD_CRITICAL":
            return {
                "error_code": error_code,
                "title": "Windows Critical BSOD Recovery Procedure",
                "nodes": [
                    {"id": "b1", "title": "Verify Storage Detection", "description": "Ensure SSD/HDD NVMe controller displays in UEFI/BIOS boards", "status": "completed"},
                    {"id": "b2", "title": "Configure Controller Mode", "description": "Set controller interfaces from IDE to AHCI or NVMe compatible settings", "status": "active"},
                    {"id": "b3", "title": "Repair Corrupted Sectors", "description": "Boot into Recovery command prompt and run chkdsk parameters", "status": "pending"},
                    {"id": "b4", "title": "Restore Boot Record", "description": "Run bootrec protocols to repair Master Boot Records", "status": "pending"},
                    {"id": "b5", "title": "Verify OS Load", "description": "Perform system boot test to verify stable desktop launch", "status": "pending"}
                ],
                "edges": [
                    {"source": "b1", "target": "b2"},
                    {"source": "b2", "target": "b3"},
                    {"source": "b3", "target": "b4"},
                    {"source": "b4", "target": "b5"}
                ]
            }
            
        # Default workflow
        return {
            "error_code": error_code,
            "title": "General System Recovery Workflow",
            "nodes": default_nodes,
            "edges": [
                {"source": "init", "target": "logs"},
                {"source": "logs", "target": "resolve"},
                {"source": "resolve", "target": "verify"}
            ]
        }
