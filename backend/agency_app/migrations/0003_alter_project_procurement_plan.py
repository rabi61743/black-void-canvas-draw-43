# Generated by Django 5.1.7 on 2025-05-30 06:13

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agency_app', '0002_project_procurement_plan'),
        ('procurement', '0002_alter_procurementplan_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='procurement_plan',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='agency_projects', to='procurement.procurementplan', unique=True),
        ),
    ]
