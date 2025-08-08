import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">Privacy Policy</h1>
          <p className="text-xl text-gray-400">How we handle your data and protect your privacy</p>
        </div>

        <div className="space-y-8">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-[#8b5cf6]">Data Collection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-gray-300">Demon Bot collects minimal data necessary for functionality:</p>
              <ul className="text-gray-300 space-y-2">
                <li>• Discord user IDs for command execution</li>
                <li>• Server IDs for configuration storage</li>
                <li>• Message content only when explicitly using commands</li>
                <li>• No personal information beyond Discord's public data</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-[#8b5cf6]">Data Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Your data is used exclusively for:</p>
              <ul className="text-gray-300 space-y-2">
                <li>• Providing bot functionality and commands</li>
                <li>• Storing server-specific settings and preferences</li>
                <li>• Moderation logging (when enabled)</li>
                <li>• Improving bot performance and reliability</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-[#8b5cf6]">Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">We implement security measures to protect your data:</p>
              <ul className="text-gray-300 space-y-2">
                <li>• Encrypted data transmission</li>
                <li>• Secure database storage</li>
                <li>• Regular security audits</li>
                <li>• Limited access to authorized personnel only</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-[#8b5cf6]">Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">You have the right to:</p>
              <ul className="text-gray-300 space-y-2">
                <li>• Request deletion of your data</li>
                <li>• Access information we store about you</li>
                <li>• Opt-out of data collection by removing the bot</li>
                <li>• Contact us with privacy concerns</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-[#8b5cf6]">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                For privacy-related questions or requests, contact us through our{" "}
                <a href="#" className="text-[#8b5cf6] hover:underline">
                  Discord support server
                </a>{" "}
                or email us at{" "}
                <a href="mailto:privacy@demonbot.com" className="text-[#8b5cf6] hover:underline">
                  privacy@demonbot.com
                </a>
              </p>
              <p className="text-gray-400 text-sm mt-4">Last updated: December 2024</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
