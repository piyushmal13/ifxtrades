import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Settings | IFXTrades",
    description: "Manage your IFXTrades account settings, notifications, security, and preferences.",
};

export default function SettingsPage() {
    return (
        <main className="min-h-screen bg-[#020617] pt-28 pb-20 px-6 text-white">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.05),transparent)] pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <p className="text-[10px] uppercase tracking-[0.28em] text-jpm-gold/70 mb-2">Configuration</p>
                <h1 className="font-serif text-4xl text-white tracking-tight mb-1">Account Settings</h1>
                <p className="text-sm text-white/40 mb-10">
                    Manage your profile, security preferences, and notification settings.
                </p>

                <div className="space-y-4">
                    {/* Profile Section */}
                    <SettingsSection title="Profile" description="Your public identity on the platform.">
                        <div className="grid grid-cols-2 gap-4">
                            <FieldRow label="First Name" value="James" placeholder="First name" />
                            <FieldRow label="Last Name" value="Whitmore" placeholder="Last name" />
                        </div>
                        <FieldRow label="Email Address" value="james@institution.com" placeholder="Email" type="email" />
                        <FieldRow label="Country / Jurisdiction" value="United Kingdom" placeholder="Country" />
                        <div className="flex justify-end pt-2">
                            <button className="btn-base btn-md btn-primary">Save Profile</button>
                        </div>
                    </SettingsSection>

                    {/* Notifications */}
                    <SettingsSection title="Notifications" description="Control which communications you receive.">
                        <div className="space-y-4">
                            {[
                                { label: "Webinar reminders", desc: "48h and 1h before sessions", defaultOn: true },
                                { label: "New algo alerts", desc: "When new strategies are published", defaultOn: true },
                                { label: "Research briefings", desc: "Weekly macro research digest", defaultOn: false },
                                { label: "Platform updates", desc: "Feature releases and maintenance", defaultOn: false },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-sm text-white/80 font-medium">{item.label}</p>
                                        <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" aria-label={item.label} />
                                        <div className="w-10 h-5 bg-white/10 peer-focus-visible:ring-[3px] peer-focus-visible:ring-jpm-gold/50 rounded-full peer peer-checked:bg-jpm-gold/80 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 transition-all" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </SettingsSection>

                    {/* Security */}
                    <SettingsSection title="Security" description="Password and two-factor authentication.">
                        <div className="space-y-4">
                            <FieldRow label="Current Password" value="" placeholder="••••••••" type="password" />
                            <FieldRow label="New Password" value="" placeholder="Min. 8 characters + 1 number" type="password" />
                            <div className="flex justify-end pt-2">
                                <button className="btn-base btn-md btn-outline">Update Password</button>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white/80 font-medium">Two-Factor Authentication</p>
                                        <p className="text-xs text-white/35 mt-0.5">Add an extra layer of security to your account</p>
                                    </div>
                                    <button className="btn-base btn-sm btn-ghost border border-white/15">Enable 2FA</button>
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    {/* Danger Zone */}
                    <SettingsSection title="Danger Zone" description="Irreversible account actions." danger>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-400 font-medium">Delete Account</p>
                                <p className="text-xs text-white/35 mt-0.5">This permanently removes all your data</p>
                            </div>
                            <button className="btn-base btn-sm btn-danger">Delete Account</button>
                        </div>
                    </SettingsSection>
                </div>
            </div>
        </main>
    );
}

function SettingsSection({
    title, description, children, danger = false,
}: {
    title: string; description: string; children: React.ReactNode; danger?: boolean;
}) {
    return (
        <section
            className={`card p-6 space-y-5 ${danger ? "border-red-400/15" : ""}`}
            aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
            <div className="pb-4 border-b border-white/8">
                <h2
                    id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`text-sm font-semibold uppercase tracking-[0.12em] ${danger ? "text-red-400" : "text-jpm-gold"}`}
                >
                    {title}
                </h2>
                <p className="text-xs text-white/35 mt-1">{description}</p>
            </div>
            {children}
        </section>
    );
}

function FieldRow({ label, value, placeholder, type = "text" }: {
    label: string; value: string; placeholder?: string; type?: string;
}) {
    return (
        <div>
            <label className="field-label mb-2 block">{label}</label>
            <input
                type={type}
                defaultValue={value}
                placeholder={placeholder}
                autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : "off"}
                className="input-base"
            />
        </div>
    );
}
