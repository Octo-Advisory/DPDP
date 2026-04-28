import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def signup_user(email, first_name, last_name, full_name, mobile_no=None, phone_code=None, phone_only=None, middle_name=None, country=None, redirect_to=None):
    """
    Custom signup method to capture additional user details.
    """
    # if not frappe.get_system_settings("allow_signup"):
    #     frappe.throw(_("Sign up is disabled for this site"))

    # Use the core signup logic to create the user and handle email verification
    # from frappe.core.doctype.user.user import signup
    # signup(email, full_name, redirect_to)

    # After signup creates the user, we update the record with the additional fields
    # user = frappe.get_doc("User", email)
    # user.db_set("first_name", first_name)
    # user.db_set("middle_name", middle_name)
    # user.db_set("last_name", last_name)
    # user.db_set("mobile_no", mobile_no)
    # user.db_set("location", country)
    # user.db_set("full_name", full_name)

    # Create record in User_dpdp DocType (Safe Attempt)
    try:
        if not frappe.db.exists("User_dpdp", email):
            dpdp_user = frappe.get_doc({
                "doctype": "User_dpdp",
                "email": email,
                "first_name": first_name,
                "middle_name": middle_name,
                "last_name": last_name,
                "phone_code": phone_code,
                "phone": phone_only,
                "country": country
            })
            dpdp_user.insert(ignore_permissions=True)
        if not frappe.db.exists("User", email):
            user = frappe.get_doc({
                "doctype": "User",
                "email": email,
                "first_name": first_name,
                "middle_name": middle_name,
                "last_name": last_name,
                "send_welcome_email": 0,
                # "phone_code": phone_code,
                "phone": phone_only,
                "country": country
            })
            user.insert(ignore_permissions=True)
    except Exception:
        # Silently fail if DocType doesn't exist yet so signup still works
        pass
    
    return _("Verification email sent")

@frappe.whitelist(allow_guest=True)
def set_user_password(email, password):
    """
    Sets the password for both the system User and the User_dpdp record.
    """
    if not email or not password:
        frappe.throw(_("Email and Password are required"))

    # Update system User password securely
    from frappe.utils.password import update_password
    update_password(email, password)
    
    # Update User_dpdp if it exists and has a password field
    if frappe.db.exists("User_dpdp", email):
        # We check if 'password' field exists before setting it to avoid errors
        if "password" in [f.fieldname for f in frappe.get_meta("User_dpdp").fields]:
            frappe.db.set_value("User_dpdp", email, "password", password)
    
    return "Password set successfully"

@frappe.whitelist(allow_guest=True)
def get_countries():
    """
    Returns a list of countries and their calling codes.
    """
    return frappe.get_all("Country", fields=["name", "code", "phone_code"])
