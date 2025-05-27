"use client"
import { Link, useLocation } from "react-router-dom"

const settingsLinks = [
  {
    title: "Edit Profile",
    href: "/settings/edit-profile",
  },
  {
    title: "Change Password",
    href: "/settings/change-password",
  },
  {
    title: "Authorized Applications",
    href: "/settings",
  },
  {
    title: "Email and SMS",
    href: "/settings/email-sms",
  },
  {
    title: "Manage Contacts",
    href: "/settings/contacts",
  },
  {
    title: "Privacy and Security",
    href: "/settings/privacy",
  },
]

const SettingsSidebar = () => {
  const location = useLocation()

  return (
    <div className="w-80 border-r bg-white">
      <div className="p-6">
        <nav className="space-y-1">
          {settingsLinks.map((item) => {
            const isActive = location.pathname === item.href || (item.href === "/settings" && location.pathname === "/settings")
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`block rounded-md px-4 py-3 text-sm font-medium ${
                  isActive ? "border-l-2 border-black bg-gray-50 text-black" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default SettingsSidebar;
