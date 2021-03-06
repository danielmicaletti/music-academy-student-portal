# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2017-02-14 20:35
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course_title', models.CharField(blank=True, max_length=100, null=True)),
                ('course_subtitle', models.CharField(blank=True, max_length=240, null=True)),
                ('course_length', models.CharField(blank=True, max_length=3, null=True)),
                ('course_active', models.BooleanField(default=True)),
                ('monday', models.BooleanField(default=True)),
                ('tuesday', models.BooleanField(default=True)),
                ('wednesday', models.BooleanField(default=True)),
                ('thursday', models.BooleanField(default=True)),
                ('friday', models.BooleanField(default=True)),
                ('saturday', models.BooleanField(default=True)),
                ('sunday', models.BooleanField(default=True)),
                ('course_start_time', models.TimeField(blank=True, max_length=6, null=True)),
                ('course_end_time', models.TimeField(blank=True, max_length=6, null=True)),
                ('course_recurring_end_date', models.DateTimeField(blank=True, max_length=50, null=True)),
                ('course_created', models.DateTimeField(auto_now_add=True)),
                ('course_age_min', models.CharField(blank=True, default=0, max_length=2, null=True)),
                ('course_age_max', models.CharField(blank=True, default=99, max_length=2, null=True)),
                ('white', models.BooleanField(default=True)),
                ('red', models.BooleanField(default=True)),
                ('yellow', models.BooleanField(default=True)),
                ('green', models.BooleanField(default=True)),
                ('blue', models.BooleanField(default=True)),
                ('purple', models.BooleanField(default=True)),
                ('brown', models.BooleanField(default=True)),
                ('black', models.BooleanField(default=True)),
                ('practice_min', models.CharField(blank=True, default=0, max_length=4, null=True)),
                ('course_credit', models.CharField(blank=True, default=0, max_length=3, null=True)),
                ('max_student', models.CharField(blank=True, max_length=2, null=True)),
                ('course_private', models.BooleanField(default=False)),
                ('course_created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='course_created', to=settings.AUTH_USER_MODEL)),
                ('course_location', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='location_course', to='users.Location')),
                ('course_private_student', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='CourseSchedule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('schedule_date', models.DateField(blank=True, max_length=50, null=True)),
                ('schedule_start_time', models.TimeField(blank=True, max_length=6, null=True)),
                ('schedule_end_time', models.TimeField(blank=True, max_length=6, null=True)),
                ('schedule_created', models.DateTimeField(auto_now_add=True)),
                ('schedule_updated', models.DateTimeField(auto_now_add=True)),
                ('schedule_canceled', models.BooleanField(default=False)),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='schedule.Course')),
                ('schedule_created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='schedule_created', to=settings.AUTH_USER_MODEL)),
                ('schedule_recurring_user', models.ManyToManyField(blank=True, related_name='user_recurring', to=settings.AUTH_USER_MODEL)),
                ('schedule_updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='schedule_updated', to=settings.AUTH_USER_MODEL)),
                ('student', models.ManyToManyField(blank=True, related_name='course_student', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
