#!/usr/bin/env python
import os
import sys
import socket
import re

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return False
        except socket.error:
            return True

def main():
    # --- Django's original setup code ---
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # ⚠️ Replace with your project name
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH? Did you forget to activate a virtual environment?"
        ) from exc

    # --- Port-checking logic ---
    if 'runserver' in sys.argv:
        port_pattern = re.compile(r':(\d+)$')
        port_specified = any(port_pattern.search(arg) for arg in sys.argv)
        
        if not port_specified:
            start_port = 8000
            current_port = start_port
            max_port = 8100  # Max port to check
            
            while current_port <= max_port:
                if not is_port_in_use(current_port):
                    sys.argv.append(f"127.0.0.1:{current_port}")  # Append as "address:port"
                    break
                current_port += 1
            else:
                print(f"No available ports between {start_port} and {max_port}.")
                sys.exit(1)

    # Run the command
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

