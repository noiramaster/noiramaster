import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email && user.name) {
        const supabase = getDb()
        const googleId = account.providerAccountId
        const { data: existing } = await supabase
          .from('usuarios_selfservice')
          .select('id')
          .eq('google_id', googleId)
          .maybeSingle()
        if (!existing) {
          await supabase.from('usuarios_selfservice').insert({
            google_id: googleId,
            email: user.email,
            nombre: user.name,
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/app/self-service',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
