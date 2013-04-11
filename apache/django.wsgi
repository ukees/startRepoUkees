import os, sys

sys.path.append("/home/oleh/tapi/sipTest/")
os.environ["DJANGO_SETTINGS_MODULE"] = "sipTest.settings"

from django.core.handlers.wsgi import WSGIHandler

application = WSGIHandler()
