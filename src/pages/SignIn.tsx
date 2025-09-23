import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'
import '../assets/css/bootstrap.min.css'
import '../assets/css/style.css'

const SignIn = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Apply body styles like the HTML
  useEffect(() => {
    // Add Google Fonts link to head if not already present
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href =
        'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800&display=swap'
      document.head.appendChild(link)
    }

    // Apply body background and font like the original HTML
    document.body.style.backgroundImage = 'url(/cover.jpg)'
    document.body.style.backgroundRepeat = 'no-repeat'
    document.body.style.backgroundPosition = 'center center'
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundColor = '#e3e8ee'
    document.body.style.fontFamily = "'Nunito Sans', sans-serif"

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundImage = ''
      document.body.style.backgroundRepeat = ''
      document.body.style.backgroundPosition = ''
      document.body.style.backgroundSize = ''
      document.body.style.backgroundColor = ''
      document.body.style.fontFamily = ''
    }
  }, [])

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await auth.getSession()
      if (session) {
        navigate('/dashboard')
      }
    }

    checkSession()
  }, [navigate])

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true)
      const { error } = await auth.signInWithOAuth({
        provider: provider,
      })
      if (error) {
        setError(`Error signing in with ${provider}: ${error.message}`)
      }
    } catch (err) {
      setError(`An error occurred with ${provider} login`)
      console.error(`${provider} login error:`, err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await auth.signIn(email, password)

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Success - navigate to dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100">
      <div className="bg-overlay"></div>
      <div className="container d-flex align-items-center px-5 h-screen z-1 relative">
        <div
          className="shadow bg-indigo-950 d-flex flex-column form-layout"
          style={{
            background: `
              linear-gradient(180deg, rgba(27, 24, 63, 0.9) 0%, rgba(27, 24, 63, 0.9) 30%, rgba(27, 24, 63, 0.6) 70%, rgba(27, 24, 63, 0.8) 100%) padding-box,
              linear-gradient(180deg, #cb17e9, rgba(192, 30, 213, 0)) border-box
            `,
            border: '4px solid transparent',
            borderRadius: '20px',
          }}
        >
          <div className="d-flex justify-content-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-link p-0 border-0 bg-transparent"
              type="button"
            >
              <img
                src="/Logo_Lexi_710.png"
                alt="LexiMind"
                style={{ width: '120px', height: 'auto' }}
              />
            </button>
          </div>

          <h2 className="text-xl text-white text-center mb-3">
            {t('auth.signInSubtitle', 'Welcome Back')}
          </h2>

          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="mb-3 pt-2 d-flex flex-column align-items-center">
              <div style={{ width: '400px' }}>
                <label
                  htmlFor="email"
                  className="form-label text-white text-sm mb-2 d-block text-start"
                >
                  {t('auth.email', 'Email or Username')}
                </label>
              </div>
              <input
                type="email"
                className="form-control border-0 py-3 px-3"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  fontSize: '16px',
                  width: '400px',
                  height: '38px',
                }}
              />
            </div>

            <div className="mb-3 pt-2 d-flex flex-column align-items-center">
              <div style={{ width: '400px' }}>
                <label
                  htmlFor="password"
                  className="form-label text-white text-sm mb-2 d-block text-start"
                >
                  {t('auth.password', 'Password')}
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  className="form-control border-0 py-3 px-3"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    fontSize: '16px',
                    width: '400px',
                    height: '38px',
                  }}
                />
              </div>
            </div>

            <div className="text-center mt-4 pt-2">
              <button
                type="submit"
                className="btn d-flex align-items-center justify-content-center mx-auto"
                disabled={loading || !email || !password}
                style={{
                  background: 'linear-gradient(135deg, #ff409a, #e91e63)',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '500',
                  width: '400px',
                  height: '38px',
                  borderRadius: '0.5rem',
                }}
              >
                {loading
                  ? t('auth.signingIn', 'Signing in...')
                  : t('auth.logIn', 'Log In')}
              </button>
            </div>

            <div className="relative d-flex align-items-center justify-content-center gap-x-2 mb-3 mt-4">
              <div className="line-x"></div>
              <span className="text-center text-uppercase px-2 py-2 relative z-1 text-white text-sm">
                {t('auth.or', 'Or')}
              </span>
              <div className="line-x"></div>
            </div>

            <div className="d-flex flex-column gap-2 mb-4 align-items-center">
              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center gap-2 py-2 border border-gray-600"
                onClick={() => handleSocialLogin('google')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '200px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center gap-2 py-2 border border-gray-600"
                onClick={() => handleSocialLogin('azure')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '200px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#00bcf2" d="M0 12.5L9.5 8.5v7z" />
                  <path fill="#0078d4" d="M24 12.5L14.5 8.5v7z" />
                  <path fill="#40e0d0" d="M9.5 8.5h5v7h-5z" />
                </svg>
                Continue with Azure
              </button>

              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center gap-2 py-2 border border-gray-600"
                onClick={() => handleSocialLogin('github')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '200px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className="d-flex align-items-center justify-content-between gap-x-4 mt-4">
              <div className="d-flex align-items-center gap-x-4">
                <p className="text-sm mb-0 text-white">
                  {t('auth.noAccount', "Don't have an account?")}
                </p>
                <a
                  href="/sign-up"
                  className="text-sm no-underline text-cyan-400 hover:text-cyan-500"
                >
                  {t('auth.signUp', 'Sign up')}
                </a>
              </div>
              <a
                href="/forgot-password"
                className="text-sm no-underline text-cyan-400 hover:text-cyan-500"
              >
                {t('auth.forgotPassword', 'Forgot Password?')}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn
