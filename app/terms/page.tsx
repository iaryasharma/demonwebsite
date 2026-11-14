import type { Metadata } from "next"
import { PolicyLayout, PolicyList, PolicySection, SupportLink } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Terms of Service | Demon Bot",
  description: "The rules for using Demon Bot and its dashboard.",
}

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      subtitle="The rules for using Demon and its dashboard"
      updated="November 14, 2026"
    >
      <PolicySection title="Agreeing to these terms">
        <p>
          By adding Demon to a server, using its commands, or signing in to this website you agree to these terms and to our{" "}
          <a href="/privacy" className="text-[#8b5cf6] hover:underline">
            Privacy Policy
          </a>
          . If you do not agree, do not use Demon. You must also follow Discord&apos;s{" "}
          <a href="https://discord.com/terms" className="text-[#8b5cf6] hover:underline" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="https://discord.com/guidelines" className="text-[#8b5cf6] hover:underline" target="_blank" rel="noopener noreferrer">
            Community Guidelines
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection title="Who can use Demon">
        <p>
          You must be old enough to use Discord (13, or higher where your country requires it). To add Demon to a server you need the Manage
          Server permission there. To use the dashboard you need permission to manage the server you are changing.
        </p>
      </PolicySection>

      <PolicySection title="Acceptable use">
        <p>You agree not to:</p>
        <PolicyList
          items={[
            "Use Demon to harass, threaten, scam or target people, or to break Discord's rules or the law.",
            "Try to bypass cooldowns, permission checks, the blacklist or any other protection.",
            "Probe, overload, scrape or attack the bot, the dashboard or our services, or look for ways to access another server's data.",
            "Use Demon's moderation features to punish people for reasons that break Discord's rules.",
            "Spam commands, or use the bot to send mass unsolicited messages.",
            "Resell Demon or present it as your own service.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Server owners and administrators">
        <p>If you run a server that uses Demon, you are responsible for how you configure it. In particular:</p>
        <PolicyList
          items={[
            "Tell your members what the bot does in your server, such as message logging, deleted-message tracking, AutoMod, verification and ticket transcripts.",
            "Use moderation and security tools fairly and lawfully. You decide who can run them.",
            "Protect access to log channels, ticket transcripts and the dashboard, because they can contain members' messages.",
          ]}
        />
      </PolicySection>

      <PolicySection title="Your content">
        <p>
          You keep ownership of what you send. By using Demon you let it read, process and, where a feature needs it, store that content so the
          feature can work, as described in the Privacy Policy. You are responsible for what you send through the bot.
        </p>
      </PolicySection>

      <PolicySection title="Availability and changes">
        <p>
          We work to keep Demon online, but it is provided free of charge and may be unavailable, slow or changed at any time. We may add,
          change or remove commands and features, including paid ones, with or without notice.
        </p>
      </PolicySection>

      <PolicySection title="Blacklisting and ending access">
        <p>
          We may blacklist a user or server, or remove Demon from a server, if these terms or Discord&apos;s rules are broken or the bot is being
          abused. You can stop using Demon at any time by removing it from your server, which also deletes that server&apos;s data as described in the
          Privacy Policy. If you think a blacklist is a mistake, ask in the <SupportLink />.
        </p>
      </PolicySection>

      <PolicySection title="No warranty and limited liability">
        <p>
          Demon is provided &quot;as is&quot; and &quot;as available&quot;, without promises that it will be error-free or uninterrupted, or that moderation and
          security tools will stop every attack or mistake. To the extent the law allows, we are not responsible for lost data, lost access,
          server damage or other indirect losses that result from using, or being unable to use, Demon. Check important moderation actions
          yourself.
        </p>
      </PolicySection>

      <PolicySection title="Changes to these terms">
        <p>
          We may update these terms. The date at the top shows the latest version, and continuing to use Demon after a change means you accept
          it. Significant changes will be announced in our support server.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about these terms? Reach us in the <SupportLink />.
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}
