"use client";

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{name?: string; email?: string; message?: string; recaptcha?: string}>({});
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const validateForm = () => {
    const newErrors: {name?: string; email?: string; message?: string; recaptcha?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    
    // 如果要強制檢查前端是否有勾選 recaptcha，可解開下面註解
    const recaptchaValue = recaptchaRef.current?.getValue();
    if (!recaptchaValue) {
      newErrors.recaptcha = 'Please verify you are human';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const recaptchaValue = recaptchaRef.current?.getValue();
      
      // 送出資料到 Next.js API Route (它會再轉發給 n8n)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          token: recaptchaValue,
          source: 'company_contact_form'
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // UI 平滑過渡
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      recaptchaRef.current?.reset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Sorry, something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除該欄位的錯誤訊息
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRecaptchaChange = (value: string | null) => {
    if (value && errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: '' }));
    }
  };

  // --- Success State ---
  if (isSubmitted) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎉</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
        <p className="text-slate-600 mb-8">
          Thank you for reaching out. We will get back to you shortly.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  // --- Form State ---
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200">
      <div className="space-y-6">
        
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
              errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            } text-slate-900 focus:ring-4 transition-all outline-none`}
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            } text-slate-900 focus:ring-4 transition-all outline-none`}
            placeholder="john@company.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
            How can we help?
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
              errors.message ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            } text-slate-900 focus:ring-4 transition-all outline-none resize-none`}
            placeholder="Tell us about your project needs..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
        </div>

        {/* ReCAPTCHA */}
        <div className="flex justify-center pt-2">
          <ReCAPTCHA
            ref={recaptchaRef}
            // 使用你提供的 Site Key (實際部署建議放 .env)
            sitekey="6LdU0sIrAAAAAOZSzuaPAqphwFpcBAF8IhYhjFKb" 
            onChange={handleRecaptchaChange}
            // 改成 light theme 以配合網站風格
            theme="light" 
          />
        </div>
        {errors.recaptcha && <p className="text-center text-sm text-red-500">{errors.recaptcha}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] shadow-lg shadow-blue-600/20"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </div>
    </form>
  );
}