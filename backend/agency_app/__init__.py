
# import os
# import django
# from django.db import connection

# def run_migrations():
#     """Run migrations if tables are missing"""
#     try:
#         # Check if api_user table exists
#         with connection.cursor() as cursor:
#             cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_user';")
#             if not cursor.fetchone():
#                 print("Database tables missing. Running migrations...")
#                 # Run migrations
#                 from django.core.management import call_command
#                 call_command('migrate', interactive=False, verbosity=1)
#                 print("Migrations completed successfully.")
#     except Exception as e:
#         print(f"Error checking/running migrations: {e}")

# # Set the default app config
# default_app_config = 'agency-app.apps.ApiConfig'

# # We'll only run migrations when the server starts, not when Django is setting up
# # This avoids the circular dependency issue
# import sys
# if 'runserver' in sys.argv and not 'migrate' in sys.argv:
#     # We don't want to call django.setup() here since Django is already setting up
#     # when this module is imported during migrate command
    
#     # Only run migrations when starting the server
#     run_migrations()
