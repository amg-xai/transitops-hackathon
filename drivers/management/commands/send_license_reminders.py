from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from drivers.models import Driver


class Command(BaseCommand):
    help = "Email drivers whose license expires within N days (default 30)."

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=30, help='Look-ahead window in days')

    def handle(self, *args, **options):
        days = options['days']
        today = timezone.now().date()
        cutoff = today + timedelta(days=days)

        drivers = Driver.objects.filter(
            license_expiry__gte=today, license_expiry__lte=cutoff,
        ).exclude(status='suspended')

        sent, skipped = 0, 0
        for driver in drivers:
            if not driver.email:
                self.stdout.write(self.style.WARNING(f"Skipped {driver.name}: no email on file."))
                skipped += 1
                continue
            days_left = (driver.license_expiry - today).days
            send_mail(
                subject=f"TransitOps: Your driving license expires in {days_left} day(s)",
                message=(
                    f"Hi {driver.name},\n\nYour license ({driver.license_number}) is due to "
                    f"expire on {driver.license_expiry.strftime('%d %b %Y')}. Please renew it "
                    f"to remain eligible for trip assignments.\n\nTransitOps Fleet Operations"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[driver.email],
                fail_silently=False,
            )
            driver.last_reminder_sent_at = timezone.now()
            driver.save(update_fields=['last_reminder_sent_at'])
            sent += 1

        self.stdout.write(self.style.SUCCESS(f"\nDone. Sent: {sent}, Skipped: {skipped}, Checked: {drivers.count()}"))