'use client'

import { useState, useRef, useCallback, Suspense, lazy } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"

// Lazy load Spline for performance
const Spline = lazy(() => import('@splinetool/react-spline'))

// ============================================
// SPOTLIGHT COMPONENT (inline for single file)
// ============================================
const Spotlight = ({ className, fill }: { className?: string; fill?: string }) => {
  return (
    <svg
      className={`animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0 ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "white"}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  )
}

// ============================================
// SPLINE SCENE COMPONENT WITH INTERACTIVITY
// ============================================
interface SplineSceneProps {
  scene: string
  className?: string
  onSplineLoad?: (spline: any) => void
}

const SplineScene = ({ scene, className, onSplineLoad }: SplineSceneProps) => {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <span className="loader" />
            <span className="text-neutral-400 text-sm">Loading characters...</span>
          </div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onLoad={onSplineLoad}
      />
    </Suspense>
  )
}

// ============================================
// INPUT COMPONENT (inline for single file)
// ============================================
const Input = ({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-base text-neutral-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className || ''}`}
      {...props}
    />
  )
}

// ============================================
// BUTTON COMPONENT (inline for single file)
// ============================================
const Button = ({ 
  className, 
  variant = 'default', 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
  
  const variantStyles = variant === 'outline' 
    ? "border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-neutral-100"
    : "bg-gradient-to-r from-neutral-200 to-neutral-400 text-black font-semibold hover:from-neutral-100 hover:to-neutral-300"
  
  return (
    <button className={`${baseStyles} ${variantStyles} ${className || ''}`} {...props}>
      {children}
    </button>
  )
}

// ============================================
// LABEL COMPONENT (inline for single file)
// ============================================
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label className={`text-sm font-medium leading-none text-neutral-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props}>
      {children}
    </label>
  )
}

// ============================================
// MAIN AUTH COMPONENT
// ============================================
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  
  // Spline application reference
  const splineRef = useRef<any>(null)

  const handleSplineLoad = useCallback((splineApp: any) => {
    splineRef.current = splineApp
  }, [])

  // Trigger look away animation when password is focused
  const handlePasswordFocus = useCallback(() => {
    setIsPasswordFocused(true)
    if (splineRef.current) {
      try {
        // Emit mouseDown event to trigger look away in Spline
        splineRef.current.emitEvent('mouseDown', 'look-away')
      } catch (e) {
        // Fallback if event doesn't exist
      }
    }
  }, [])

  const handlePasswordBlur = useCallback(() => {
    setIsPasswordFocused(false)
    if (splineRef.current) {
      try {
        // Emit mouseUp event to restore normal state
        splineRef.current.emitEvent('mouseUp', 'look-away')
      } catch (e) {
        // Fallback if event doesn't exist
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(isLogin ? 'Login' : 'Register', { email, password, name })
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - 3D Characters */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/70 z-10 pointer-events-none" />
        
        {/* Interactive 3D Characters Scene - follows mouse, looks away on password */}
        <div className={`w-full h-full transition-all duration-500 ${isPasswordFocused ? 'scale-105 blur-sm' : ''}`}>
          <SplineScene
            scene="https://prod.spline.design/JYxRDYFKGbbXDfix/scene.splinecode"
            className="w-full h-full"
            onSplineLoad={handleSplineLoad}
          />
        </div>
        
        {/* Privacy indicator when password focused */}
        {isPasswordFocused && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10">
              <div className="flex items-center gap-3 text-neutral-300">
                <EyeOff className="h-6 w-6" />
                <span className="text-lg font-medium">Characters looking away...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <Spotlight
          className="-top-40 right-0 md:right-60 md:-top-20 lg:hidden"
          fill="white"
        />
        
        {/* Mobile 3D Characters Background */}
        <div className={`absolute inset-0 lg:hidden transition-all duration-500 ${isPasswordFocused ? 'opacity-10 blur-md' : 'opacity-30'}`}>
          <SplineScene
            scene="https://prod.spline.design/JYxRDYFKGbbXDfix/scene.splinecode"
            className="w-full h-full"
            onSplineLoad={handleSplineLoad}
          />
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl relative z-10">
          {/* Card Header */}
          <div className="space-y-1 p-6 pb-4">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-neutral-400 text-sm">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Enter your details to get started'}
            </p>
          </div>
          
          {/* Card Content */}
          <div className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password field - triggers look away */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {isPasswordFocused && (
                  <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                    <EyeOff className="h-3 w-3" />
                    The characters are looking away for your privacy
                  </p>
                )}
              </div>

              {/* Forgot password link */}
              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <Button type="submit" className="w-full group">
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-neutral-500">Or continue with</span>
                </div>
              </div>

              {/* Social auth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button type="button" variant="outline">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
              </div>

              {/* Toggle login/register */}
              <p className="text-center text-sm text-neutral-400 mt-6">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-neutral-200 hover:text-white font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {/* CSS for loader */}
      <style>{`
        .loader {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255,255,255,0.1);
          border-bottom-color: rgba(255,255,255,0.8);
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }
        
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spotlight {
          0% {
            opacity: 0;
            transform: translate(-72%, -62%) scale(0.5);
          }
          100% {
            opacity: 1;
            transform: translate(-50%,-40%) scale(1);
          }
        }
        
        .animate-spotlight {
          animation: spotlight 2s ease .75s 1 forwards;
        }
      `}</style>
    </div>
  )
}

export default Auth
