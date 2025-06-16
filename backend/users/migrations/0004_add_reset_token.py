
# Generated manually to fix reset_token field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_employeedetail_alter_customuser_department_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='reset_token',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
