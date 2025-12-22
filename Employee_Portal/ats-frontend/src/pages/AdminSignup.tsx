import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';
import dhiLogo from '@/assets/dhi-logo.png';

export default function AdminSignup() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: 'Password Mismatch',
                description: 'Passwords do not match. Please try again.',
                variant: 'destructive',
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: 'Weak Password',
                description: 'Password must be at least 6 characters.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.USERS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to create account');
            }

            toast({
                title: 'Account Created!',
                description: 'You can now login with your credentials.',
            });

            navigate('/login');
        } catch (error: any) {
            toast({
                title: 'Registration Failed',
                description: error.message || 'Unable to create account. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d7a5f] to-[#13a581]">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#13a581]/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-300"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            {/* Diagonal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-emerald-500/10 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Back to Login */}
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </button>

                {/* Logo/Brand */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center mb-3">
                        <img
                            src={dhiLogo}
                            alt="DHI Consultancy"
                            className="h-16 w-auto drop-shadow-2xl"
                            style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' }}
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">Admin Portal</h1>
                    <p className="text-emerald-100/80 text-sm mt-1">Create New Account</p>
                </div>

                <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl shadow-black/20">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold text-center text-white flex items-center justify-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Sign Up
                        </CardTitle>
                        <CardDescription className="text-center text-emerald-100/70">
                            Register admin or employee accounts
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/90 text-sm">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 h-11"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white/90 text-sm">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@dhiconsultancy.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="pl-10 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 h-11"
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-white/90 text-sm">Account Type</Label>
                                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                    <SelectTrigger className="bg-black/20 border-white/20 text-white h-11">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white/90 text-sm">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 h-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white/90 text-sm">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:ring-emerald-400/20 h-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 text-base font-semibold shadow-lg transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Create Account
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Custom animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
