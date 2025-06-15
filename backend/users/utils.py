# users/utils.py

from .models import RoleHierarchy

def get_role_hierarchy():
    roles = RoleHierarchy.objects.all()
    hierarchy_dict = {}

    # Loop through each role to build the hierarchy
    for role in roles:
        parent_role = role.parent.role_name if role.parent else None
        if parent_role:
            if parent_role not in hierarchy_dict:
                hierarchy_dict[parent_role] = []
            hierarchy_dict[parent_role].append(role.role_name)
        else:
            if None not in hierarchy_dict:
                hierarchy_dict[None] = []
            hierarchy_dict[None].append(role.role_name)
    
    return hierarchy_dict
