'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

// ============================================
// SPOTLIGHT COMPONENT
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
// 3D CHARACTER COMPONENT
// ============================================
interface CharacterProps {
  position: [number, number, number]
  color: string
  scale?: number
  mousePosition: React.MutableRefObject<{ x: number; y: number }>
  isLookingAway: boolean
  eyeColor?: string
}

const Character = ({ position, color, scale = 1, mousePosition, isLookingAway, eyeColor = "#ffffff" }: CharacterProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    const targetX = isLookingAway ? -Math.PI * 0.4 : mousePosition.current.x * 0.4
    const targetY = isLookingAway ? Math.PI * 0.3 : mousePosition.current.y * 0.25
    
    // Smooth rotation towards target
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.05)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05)
    
    // Floating animation
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.08
    }
    
    // Rotating ring animation
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5 + position[0]
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
    
    // Pulsing core glow
    if (coreRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1 + 0.9
      coreRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main AI node body - glowing orb */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.8} 
          transparent 
          opacity={0.6}
        />
      </mesh>
      
      {/* Inner core - bright center */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial 
          color={eyeColor} 
          emissive={color} 
          emissiveIntensity={1.5} 
          roughness={0} 
          metalness={0.2}
        />
      </mesh>
      
      {/* Orbital ring - workflow/connection symbol */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.55, 0.03, 16, 64]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5} 
          roughness={0.2} 
          metalness={0.9}
        />
      </mesh>
      
      {/* Second orbital ring - crossed */}
      <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <torusGeometry args={[0.5, 0.02, 16, 64]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.3} 
          transparent 
          opacity={0.6}
          roughness={0.2}
        />
      </mesh>
      
      {/* Connection nodes - small spheres at cardinal points */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(angle) * 0.55,
            Math.sin(angle) * 0.55 * Math.cos(Math.PI / 3),
            Math.sin(angle) * 0.55 * Math.sin(Math.PI / 3)
          ]}
        >
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial 
            color={eyeColor} 
            emissive={eyeColor} 
            emissiveIntensity={1}
          />
        </mesh>
      ))}
      
      {/* Outer glow shell */}
      <mesh scale={1.1}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.15} 
          roughness={0}
        />
      </mesh>
    </group>
  )
}

// ============================================
// 3D SCENE WITH MULTIPLE CHARACTERS
// ============================================
interface SceneProps {
  isLookingAway: boolean
}

const Scene = ({ isLookingAway }: SceneProps) => {
  const mousePosition = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  // Track mouse position
  useFrame((state) => {
    mousePosition.current.x = (state.pointer.x * viewport.width) / 2
    mousePosition.current.y = (state.pointer.y * viewport.height) / 2
  })

  // Character configurations - multiple characters with different colors and positions
  const characters = useMemo(() => [
    // Front row - main characters
    { position: [-1.5, 0, 1] as [number, number, number], color: "#6366f1", scale: 1.2, eyeColor: "#e0e7ff" },
    { position: [0, -0.3, 1.5] as [number, number, number], color: "#8b5cf6", scale: 1.4, eyeColor: "#f3e8ff" },
    { position: [1.5, 0.2, 1] as [number, number, number], color: "#ec4899", scale: 1.1, eyeColor: "#fce7f3" },
    
    // Middle row
    { position: [-2.5, 0.5, -0.5] as [number, number, number], color: "#14b8a6", scale: 0.9, eyeColor: "#ccfbf1" },
    { position: [-0.8, 0.8, -0.3] as [number, number, number], color: "#f59e0b", scale: 0.85, eyeColor: "#fef3c7" },
    { position: [0.9, 0.6, -0.2] as [number, number, number], color: "#22c55e", scale: 0.9, eyeColor: "#dcfce7" },
    { position: [2.5, 0.3, -0.5] as [number, number, number], color: "#3b82f6", scale: 0.95, eyeColor: "#dbeafe" },
    
    // Back row - smaller characters
    { position: [-3, 1.2, -2] as [number, number, number], color: "#f43f5e", scale: 0.7, eyeColor: "#ffe4e6" },
    { position: [-1.5, 1.5, -2.2] as [number, number, number], color: "#a855f7", scale: 0.65, eyeColor: "#f3e8ff" },
    { position: [0, 1.3, -2] as [number, number, number], color: "#06b6d4", scale: 0.7, eyeColor: "#cffafe" },
    { position: [1.5, 1.4, -2.2] as [number, number, number], color: "#eab308", scale: 0.65, eyeColor: "#fef9c3" },
    { position: [3, 1.1, -2] as [number, number, number], color: "#10b981", scale: 0.7, eyeColor: "#d1fae5" },
    
    // Bottom characters
    { position: [-2, -0.8, 0.5] as [number, number, number], color: "#f97316", scale: 0.8, eyeColor: "#ffedd5" },
    { position: [2, -0.7, 0.3] as [number, number, number], color: "#84cc16", scale: 0.75, eyeColor: "#ecfccb" },
  ], [])

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, -2, 3]} intensity={0.5} color="#ec4899" />
      
      <Environment preset="night" />
      
      {characters.map((char, index) => (
        <Character
          key={index}
          position={char.position}
          color={char.color}
          scale={char.scale}
          eyeColor={char.eyeColor}
          mousePosition={mousePosition}
          isLookingAway={isLookingAway}
        />
      ))}
    </>
  )
}

// ============================================
// INPUT COMPONENT
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
// BUTTON COMPONENT
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
// LABEL COMPONENT
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

  const handlePasswordFocus = useCallback(() => {
    setIsPasswordFocused(true)
  }, [])

  const handlePasswordBlur = useCallback(() => {
    setIsPasswordFocused(false)
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
        
        {/* Interactive 3D Characters Scene */}
        <div className={`w-full h-full transition-all duration-500 ${isPasswordFocused ? 'brightness-50' : ''}`}>
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <Scene isLookingAway={isPasswordFocused} />
          </Canvas>
        </div>
        
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <Spotlight
          className="-top-40 right-0 md:right-60 md:-top-20 lg:hidden"
          fill="white"
        />
        
        {/* Mobile 3D Characters Background */}
        <div className={`absolute inset-0 lg:hidden transition-all duration-500 ${isPasswordFocused ? 'opacity-10 blur-md' : 'opacity-30'}`}>
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <Scene isLookingAway={isPasswordFocused} />
          </Canvas>
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
      
      {/* CSS for animations */}
      <style>{`
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
