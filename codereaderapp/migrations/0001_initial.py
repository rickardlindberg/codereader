# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('slug', models.SlugField(unique=True)),
                ('name', models.CharField(max_length=255)),
                ('root', models.CharField(max_length=255)),
            ],
        ),
    ]
