from django.db import transaction
from users.models import RoleHierarchy

def create_role_hierarchy():
    try:
        with transaction.atomic():
            # Delete existing roles to start fresh
            RoleHierarchy.objects.all().delete()

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

            # Create SUPERADMIN role
            superadmin = RoleHierarchy.objects.create(
                role_name="SUPERADMIN",
                permissions=all_permissions
            )

            # Create main node (NTC) under SUPERADMIN
            ntc = RoleHierarchy.objects.create(
                role_name="NTC",
                parent=superadmin,
                permissions=["manage_all"]
            )

            # Create first level roles under NTC
            cco = RoleHierarchy.objects.create(
                role_name="CCO",
                parent=ntc,
                permissions=["manage_issd", "manage_isd"]
            )
            cfo = RoleHierarchy.objects.create(
                role_name="CFO",
                parent=ntc,
                permissions=["manage_finance"]
            )
            chro = RoleHierarchy.objects.create(
                role_name="CHRO",
                parent=ntc,
                permissions=["manage_ttrc", "manage_hr"]
            )
            company_secretariate = RoleHierarchy.objects.create(
                role_name="COMPANY SECRETARIATE",
                parent=ntc,
                permissions=["manage_secretariate"]
            )
            coo = RoleHierarchy.objects.create(
                role_name="COO",
                parent=ntc,
                permissions=["manage_power", "manage_provinces"]
            )
            cto = RoleHierarchy.objects.create(
                role_name="CTO",
                parent=ntc,
                permissions=["manage_btd", "manage_civil"]
            )
            rtdf = RoleHierarchy.objects.create(
                role_name="RTDF",
                parent=ntc,
                permissions=["manage_rtdf"]
            )
            wsd = RoleHierarchy.objects.create(
                role_name="WSD",
                parent=ntc,
                permissions=["manage_wsd"]
            )
            wcsd = RoleHierarchy.objects.create(
                role_name="WCSD",
                parent=ntc,
                permissions=["manage_wcsd"]
            )

            # Create second level roles under CCO
            issd = RoleHierarchy.objects.create(
                role_name="ISSD",
                parent=cco,
                permissions=["execute_issd"]
            )
            isd = RoleHierarchy.objects.create(
                role_name="ISD",
                parent=cco,
                permissions=["execute_isd"]
            )

            # Create second level role under CHRO
            ttrc = RoleHierarchy.objects.create(
                role_name="TTRC",
                parent=chro,
                permissions=["execute_ttrc"]
            )

            # Create second level roles under COO
            power = RoleHierarchy.objects.create(
                role_name="POWER",
                parent=coo,
                permissions=["execute_power"]
            )
            province_directorate = RoleHierarchy.objects.create(
                role_name="PROVINCE DIRECTORATE",
                parent=coo,
                permissions=["manage_p1_p7"]
            )

            # Create third level roles under PROVINCE DIRECTORATE
            for i in range(1, 8):
                RoleHierarchy.objects.create(
                    role_name=f"P{i}",
                    parent=province_directorate,
                    permissions=[f"execute_p{i}"]
                )

            # Create second level roles under CTO
            btd = RoleHierarchy.objects.create(
                role_name="BTD",
                parent=cto,
                permissions=["execute_btd"]
            )
            civil = RoleHierarchy.objects.create(
                role_name="CIVIL",
                parent=cto,
                permissions=["execute_civil"]
            )

            print("Role hierarchy created successfully!")
            return True

    except Exception as e:
        print(f"Error creating role hierarchy: {str(e)}")
        return False

if __name__ == "__main__":
    create_role_hierarchy()