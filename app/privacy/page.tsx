import type { Metadata } from "next"
import { PolicyLayout, PolicyList, PolicySection, PolicyTable, SupportLink } from "@/components/policy-layout"

export const metadata: Metadata = {
  title: "Privacy Policy | Demon Bot",
  description: "What data Demon Bot and its dashboard collect, why, how long it is kept, and how to have it deleted.",
}

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="What Demon collects, why, how long we keep it, and how to have it removed"
      updated="November 14, 2026"
    >
      <PolicySection title="Who this covers">
        <p>
          This policy covers the Demon Discord bot (&quot;Demon&quot;, &quot;we&quot;) and this website, including the server dashboard
          and the ticket transcript pages. By adding the bot to a server, using its commands, or signing in to the
          dashboard you accept this policy. Demon is built on Discord, so Discord&apos;s own{" "}
          <a href="https://discord.com/privacy" className="text-[#8b5cf6] hover:underline" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{" "}
          and Terms also apply.
        </p>
        <p>
          You must be old enough to use Discord (13, or higher where your country requires it). We do not knowingly collect data from
          anyone younger.
        </p>
      </PolicySection>

      <PolicySection title="What we collect, and why">
        <p>We only store data that a feature needs. Here is what each part of the bot keeps:</p>
        <PolicyTable
          head={["Feature", "Data stored", "Why"]}
          rows={[
            [
              "Server settings",
              "Server, channel and role IDs, your prefix, and the settings for welcome and leave messages, auto-roles, verification, logging, security, AutoMod, anti-raid, sticky roles, tickets, sticky messages, scheduled announcements and templates.",
              "So your configuration survives restarts.",
            ],
            [
              "Join and leave history",
              "User ID, username, join and leave dates, account creation date, roles on leave, whether the account is a bot, and a flag if the account looks suspicious.",
              "Verification, anti-raid checks, giving a returning member their old roles back (only if the server turns that on), and moderator lookups.",
            ],
            [
              "Security (anti-nuke)",
              "Violation records (user ID, action, punishment, moderator ID and note), your whitelist, and short-lived action counters.",
              "To detect and undo mass destructive actions and to show moderators what happened.",
            ],
            [
              "AutoMod",
              "Your rules (blocked words, patterns, limits, allowed domains, ignored channels and roles). We also create rules in Discord's own AutoMod on your server.",
              "To remove messages that break your server rules, including scam and phishing links.",
            ],
            [
              "Anti-raid",
              "Your settings. Join times and raid status are kept in memory only, for a few minutes, and are not saved.",
              "To spot a burst of new members and act on new accounts during a raid.",
            ],
            [
              "Message reports",
              "Nothing is stored. When a member uses Report message, the message text, author, channel and link are posted to the server's moderation log channel on Discord.",
              "So moderators can review a message a member flagged.",
            ],
            [
              "Tickets",
              "Ticket records (user ID, reason, status, who claimed or closed it, rating and rating comment). Ticket transcripts, which contain the messages sent in the ticket.",
              "To run your support system and give staff a record.",
            ],
            [
              "Deleted and edited messages",
              "Only in servers that turn /snipe on (it is off by default): the author, text and attachment links of recently deleted or edited messages.",
              "The /snipe command.",
            ],
            [
              "AFK, reminders and giveaways",
              "AFK status and reason, reminder text and time, your timezone, and the user IDs of giveaway entrants.",
              "So these commands work.",
            ],
            [
              "User profile data",
              "Custom bot badges and, for a few users, no-prefix access.",
              "Awarded by the bot owner; used by /badges and the prefix handler.",
            ],
            [
              "Abuse prevention",
              "A blacklist of abusive users and servers with the reason and expiry, and short command cooldowns.",
              "To stop misuse of the bot.",
            ],
            [
              "Support commands",
              "The text you send with /bug and /suggest, and your user ID, which are posted to our support server.",
              "So we can read and answer your report.",
            ],
            [
              "Dashboard sign-in",
              "Your Discord ID, username and avatar, and the list of servers you can manage (the identify and guilds permissions). The sign-in is kept in an encrypted, HTTP-only cookie for up to 30 days.",
              "To show only the servers you manage and check your permissions before every change.",
            ],
            [
              "Error logs",
              "Error details that may include a server ID, user ID and the command that failed, sent to a private developer channel.",
              "To find and fix bugs.",
            ],
          ]}
        />
        <p>
          The bot also reads messages as they arrive so it can run commands and rules. Unless a row above says otherwise, that text is
          used in the moment and not stored.
        </p>
      </PolicySection>

      <PolicySection title="What we do not collect">
        <PolicyList
          items={[
            "Passwords, payment details or government IDs.",
            "Voice or audio. Voice commands only move, mute or kick people.",
            "Private messages, except what you send directly to the bot.",
            "Your browsing activity outside this website.",
          ]}
        />
        <p>We do not sell your data, share it for advertising, or use it to train AI or machine-learning models.</p>
      </PolicySection>

      <PolicySection title="Discord privileged intents">
        <p>
          Discord asks us to explain the intents that give a bot extra data. Demon uses the two below for the reasons given. It does not use the
          Presence intent and cannot see anyone&apos;s online status or activity.
        </p>
        <PolicyList
          items={[
            <>
              <strong>Server Members.</strong> Needed to react when someone joins, leaves or changes roles: welcome and leave messages, auto-roles,
              sticky roles, verification, anti-raid and anti-nuke protection, and member logs. We store a short join and leave history (see the
              table above).
            </>,
            <>
              <strong>Message Content.</strong> Needed to check messages against your AutoMod rules (for example scam and phishing links,
              repeated messages, capital letters or links to domains you have not allowed) and to include the text of deleted and edited messages in
              your server&apos;s log channel. It also reads text commands that people type, and if a server turns /snipe on, it answers that command. We store deleted and edited messages for 24
              hours (only where /snipe is on) and ticket transcripts for 7 days. Other message text is not saved.
            </>,
          ]}
        />
        <p>
          Server administrators control these features. They can turn off logging with /logs, AutoMod with /automod, and individual commands with
          /disable.
        </p>
      </PolicySection>

      <PolicySection title="How long we keep data">
        <PolicyTable
          head={["Data", "Kept for"]}
          rows={[
            ["Deleted and edited messages (/snipe, only where turned on)", "24 hours, then deleted automatically."],
            ["Anti-raid join counters and raid status", "A few minutes, in memory only."],
            ["Ticket transcripts", "7 days, then deleted automatically."],
            ["Security action counters", "About 2 hours."],
            ["Command cooldowns", "Until the cooldown ends."],
            ["AutoMod strike counts", "10 minutes, in memory only. They reset if the bot restarts."],
            ["Reminders", "Until delivered or cancelled."],
            ["Blacklist records", "Until they expire or are removed."],
            ["Dashboard sign-in cookie", "Up to 30 days, or until you sign out."],
            [
              "Server settings, join history, security records, ticket records, giveaways and the other server data above",
              "While the bot is in your server. When the bot is removed from a server we delete that server's data automatically.",
            ],
            ["Global AFK, private reminders and user-level badges", "Until you remove them or ask us to delete them."],
          ]}
        />
        <p>Backups and server logs held by our providers may keep copies for a short time after deletion.</p>
      </PolicySection>

      <PolicySection title="Who we share data with">
        <p>We share data only with the services needed to run Demon:</p>
        <PolicyList
          items={[
            "Discord, which delivers every message, command and event to the bot and receives what the bot sends back.",
            "MongoDB Atlas, our database host.",
            "Vercel, which hosts this website and provides privacy-friendly page analytics (no advertising cookies).",
            "The Jikan API, which receives the title you type into the anime search command. Other fun commands call image APIs and send no personal data.",
          ]}
        />
        <p>
          Content that a server&apos;s own logging or AutoMod posts goes to that server&apos;s log channel on Discord, and its administrators control
          who can read it. We may also disclose information if the law requires it or to stop abuse of the bot.
        </p>
      </PolicySection>

      <PolicySection title="How we protect data">
        <PolicyList
          items={[
            "Everything travels over HTTPS or Discord's encrypted connections.",
            "Webhook tokens for logging are stored encrypted.",
            "Dashboard actions check that you can manage the server you are changing.",
            "Access to the database and bot hosting is limited to the people who run Demon.",
          ]}
        />
        <p>No system is perfectly secure. If you find a problem, please tell us through the support server.</p>
      </PolicySection>

      <PolicySection title="Your choices and rights">
        <PolicyList
          items={[
            "Ask what we hold about you, or ask us to delete it. Include your Discord user ID.",
            "Server owners can remove the bot at any time, which deletes that server's data.",
            "You can clear your own AFK status and reminders with their commands.",
            "Server administrators can switch off logging, AutoMod, anti-raid, sticky roles, /snipe and individual commands.",
          ]}
        />
        <p>
          Demon works at the server level, so we cannot offer a personal opt-out inside a server that uses it. If you do not want your messages
          processed, leave the server or ask its administrators to disable the feature.
        </p>
      </PolicySection>

      <PolicySection title="Changes">
        <p>
          We may update this policy as Demon changes. The date at the top shows the latest version. If a change matters to you we will announce it
          in our support server.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          For privacy questions or deletion requests, message us in the <SupportLink />.
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}
