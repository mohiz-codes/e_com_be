# Admin setup

Create a normal account first, then promote it using the email address used at signup:

```powershell
npm run make-admin -- admin@example.com
```

The account must sign out and back in after promotion so its access token contains the new role. Administrators can manage orders, issue Stripe refunds, see sales totals, and create products from the Admin Dashboard.
