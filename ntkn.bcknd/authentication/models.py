from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager
from django.db import models
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill

class Photo(models.Model):
	original = models.ImageField(upload_to='account_photos')
	thumbnail_30x30 = ImageSpecField(source='original', processors=[ResizeToFill(30, 30)], format='JPEG', options={'quality': 100})
	thumbnail_50x50 = ImageSpecField(source='original', processors=[ResizeToFill(50, 50)], format='JPEG', options={'quality': 100})
	thumbnail_100x100 = ImageSpecField(source='original', processors=[ResizeToFill(100, 100)], format='JPEG', options={'quality': 100})

class AccountManager(BaseUserManager):
	def create_user(self, email, password=None, **kwargs):
		if not email:
			raise ValueError('Users must have a valid email address.')

		if not kwargs.get('username'):
			raise ValueError('Users must have a valid username.')

		account = self.model(
            email=self.normalize_email(email), username=kwargs.get('username')
        )
        
		account.set_password(password)
		account.is_active = True
		account.save()
		return account

	def create_superuser(self,email, password, **kwargs):
		account = self.create_user(email, password, **kwargs)
		account.is_admin = True
		account.save()
		return account


class Account(AbstractBaseUser):
	email = models.EmailField(unique=True)
	username = models.CharField(max_length=50, unique=True)
	first_name = models.CharField(max_length=50, blank=True)
	last_name = models.CharField(max_length=50, blank=True)
	is_admin = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	objects = AccountManager()
	is_active = models.BooleanField(default=True)
	photo = models.OneToOneField(Photo, blank=True, null=True)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['username']

	def __unicode__(self):
		return self.email

	def get_full_name(self):
		return ' '.join([self.first_name, self.last_name])

	def get_short_name(self):
		return self.first_name		

	@property
	def is_superuser(self):
		return self.is_admin

	@property
	def is_staff(self):
		return self.is_admin

	def has_perm(self, perm, obj=None):
		return self.is_admin

	def has_module_perms(self, app_label):
		return self.is_admin

