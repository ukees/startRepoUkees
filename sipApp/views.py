#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.http import HttpResponse
from models import Customer
from django.utils import simplejson

def getCust(request):
    customer = None
    if request.method == "POST":
        pub_id = request.POST.get("pub_identity", False)
        if pub_id:
            pub_id = pub_id.strip("<>")
            try:
                customer = Customer.objects.filter(public_identity = pub_id).values()[0]
            except IndexError:
                pass
        if request.is_ajax():
            return HttpResponse(simplejson.dumps(customer), mimetype="application/json")
    return render(request, "base.html", locals())

def test(request):
    res = "!!"
    return render(request, "testStatic.html", locals())
