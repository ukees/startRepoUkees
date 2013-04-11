from django.db import models

class Customer(models.Model):
    name = models.TextField(max_length=50)
    address = models.TextField(max_length=60)
    public_identity = models.TextField()
    description = models.TextField()

    def __unicode__(self):
        return self.public_identity

    class Meta():
        verbose_name_plural = u"Customers"
