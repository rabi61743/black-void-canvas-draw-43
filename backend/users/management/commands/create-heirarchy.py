from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import RoleHierarchy

class Command(BaseCommand):
    help = 'Creates the role hierarchy for the organization without deleting existing roles'

    def handle(self, *args, **options):
        try:
            with transaction.atomic():
                # Define all possible permissions
                all_permissions = [
                    "manage_all", "manage_issd", "manage_isd", "manage_finance",
                    "manage_ttrc", "manage_hr", "manage_secretariate", "manage_power",
                    "manage_provinces", "manage_btd", "manage_civil", "manage_rtdf",
                    "manage_wsd", "manage_wcsd", "execute_issd", "execute_isd",
                    "execute_ttrc", "execute_power", "manage_p1_p7", "execute_p1",
                    "execute_p2", "execute_p3", "execute_p4", "execute_p5",
                    "execute_p6", "execute_p7", "execute_btd", "execute_civil"
                ]

                # Create or get SUPERADMIN role
                superadmin, created = RoleHierarchy.objects.get_or_create(
                    role_name="SUPERADMIN",
                    defaults={'permissions': all_permissions}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created SUPERADMIN role'))
                else:
                    self.stdout.write(self.style.WARNING('SUPERADMIN role already exists'))

                # Create or get NTC role under SUPERADMIN
                ntc, created = RoleHierarchy.objects.get_or_create(
                    role_name="NTC",
                    parent=superadmin,
                    defaults={'permissions': ["manage_all"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created NTC role'))
                else:
                    self.stdout.write(self.style.WARNING('NTC role already exists'))

                # Create or get first level roles under NTC
                cco, created = RoleHierarchy.objects.get_or_create(
                    role_name="CCO",
                    parent=ntc,
                    defaults={'permissions': ["manage_issd", "manage_isd"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created CCO role'))
                else:
                    self.stdout.write(self.style.WARNING('CCO role already exists'))

                cfo, created = RoleHierarchy.objects.get_or_create(
                    role_name="CFO",
                    parent=ntc,
                    defaults={'permissions': ["manage_finance"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created CFO role'))
                else:
                    self.stdout.write(self.style.WARNING('CFO role already exists'))

                chro, created = RoleHierarchy.objects.get_or_create(
                    role_name="CHRO",
                    parent=ntc,
                    defaults={'permissions': ["manage_ttrc", "manage_hr"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created CHRO role'))
                else:
                    self.stdout.write(self.style.WARNING('CHRO role already exists'))

                company_secretariate, created = RoleHierarchy.objects.get_or_create(
                    role_name="COMPANY SECRETARIATE",
                    parent=ntc,
                    defaults={'permissions': ["manage_secretariate"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created COMPANY SECRETARIATE role'))
                else:
                    self.stdout.write(self.style.WARNING('COMPANY SECRETARIATE role already exists'))

                coo, created = RoleHierarchy.objects.get_or_create(
                    role_name="COO",
                    parent=ntc,
                    defaults={'permissions': ["manage_power", "manage_provinces"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created COO role'))
                else:
                    self.stdout.write(self.style.WARNING('COO role already exists'))

                cto, created = RoleHierarchy.objects.get_or_create(
                    role_name="CTO",
                    parent=ntc,
                    defaults={'permissions': ["manage_btd", "manage_civil"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created CTO role'))
                else:
                    self.stdout.write(self.style.WARNING('CTO role already exists'))

                rtdf, created = RoleHierarchy.objects.get_or_create(
                    role_name="RTDF",
                    parent=ntc,
                    defaults={'permissions': ["manage_rtdf"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created RTDF role'))
                else:
                    self.stdout.write(self.style.WARNING('RTDF role already exists'))

                wsd, created = RoleHierarchy.objects.get_or_create(
                    role_name="WSD",
                    parent=ntc,
                    defaults={'permissions': ["manage_wsd"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created WSD role'))
                else:
                    self.stdout.write(self.style.WARNING('WSD role already exists'))

                wcsd, created = RoleHierarchy.objects.get_or_create(
                    role_name="WCSD",
                    parent=ntc,
                    defaults={'permissions': ["manage_wcsd"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created WCSD role'))
                else:
                    self.stdout.write(self.style.WARNING('WCSD role already exists'))

                # Create or get second level roles under CCO
                issd, created = RoleHierarchy.objects.get_or_create(
                    role_name="ISSD",
                    parent=cco,
                    defaults={'permissions': ["execute_issd"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created ISSD role'))
                else:
                    self.stdout.write(self.style.WARNING('ISSD role already exists'))

                isd, created = RoleHierarchy.objects.get_or_create(
                    role_name="ISD",
                    parent=cco,
                    defaults={'permissions': ["execute_isd"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created ISD role'))
                else:
                    self.stdout.write(self.style.WARNING('ISD role already exists'))

                # Create or get second level role under CHRO
                ttrc, created = RoleHierarchy.objects.get_or_create(
                    role_name="TTRC",
                    parent=chro,
                    defaults={'permissions': ["execute_ttrc"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created TTRC role'))
                else:
                    self.stdout.write(self.style.WARNING('TTRC role already exists'))

                # Create or get second level roles under COO
                power, created = RoleHierarchy.objects.get_or_create(
                    role_name="POWER",
                    parent=coo,
                    defaults={'permissions': ["execute_power"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created POWER role'))
                else:
                    self.stdout.write(self.style.WARNING('POWER role already exists'))

                province_directorate, created = RoleHierarchy.objects.get_or_create(
                    role_name="PROVINCE DIRECTORATE",
                    parent=coo,
                    defaults={'permissions': ["manage_p1_p7"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created PROVINCE DIRECTORATE role'))
                else:
                    self.stdout.write(self.style.WARNING('PROVINCE DIRECTORATE role already exists'))

                # Create or get third level roles under PROVINCE DIRECTORATE
                for i in range(1, 8):
                    role_name = f"P{i}"
                    p_role, created = RoleHierarchy.objects.get_or_create(
                        role_name=role_name,
                        parent=province_directorate,
                        defaults={'permissions': [f"execute_p{i}"]}
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f'Created {role_name} role'))
                    else:
                        self.stdout.write(self.style.WARNING(f'{role_name} role already exists'))

                # Create or get second level roles under CTO
                btd, created = RoleHierarchy.objects.get_or_create(
                    role_name="BTD",
                    parent=cto,
                    defaults={'permissions': ["execute_btd"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created BTD role'))
                else:
                    self.stdout.write(self.style.WARNING('BTD role already exists'))

                civil, created = RoleHierarchy.objects.get_or_create(
                    role_name="CIVIL",
                    parent=cto,
                    defaults={'permissions': ["execute_civil"]}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS('Created CIVIL role'))
                else:
                    self.stdout.write(self.style.WARNING('CIVIL role already exists'))

                self.stdout.write(self.style.SUCCESS('Role hierarchy setup completed successfully!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error setting up role hierarchy: {str(e)}'))