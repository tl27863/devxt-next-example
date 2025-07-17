'use client'
import { use } from 'react';
import { notFound } from 'next/navigation';
import { SingleCard } from '@/layouts';
import {
  LoginForm,
  CreateAccountForm,
  ResetPasswordForm,
  ChangePasswordForm,
} from '@/components';

const formText: Record<string, Record<string, string>> = {
  'login': {
    title: 'Sign In'
  },
  'create-account': {
    title: 'Sign Up'
  },
  'reset-password': {
    title: 'Reset Password',
    description: 'Please enter the email address that you used to register, and we will send you a link to reset your password via Email.'
  },
  'change-password': {
    title: 'Change Password',
  }
}

function AuthForm({name}: {name: string}) {
  switch (name) {
    case 'login': return <LoginForm />;
    case 'create-account': return <CreateAccountForm />;
    case 'reset-password': return <ResetPasswordForm />;
    case 'change-password': return <ChangePasswordForm />;
  }
}

export default function AuthPage({ params }: {params: Promise<{type: string}>}) {
  const { type } = use(params)

  if (!formText[type]) {
    notFound();
  }

  const { title, description } = formText[type];

  return <SingleCard title={title} description={description}>
    <AuthForm name={type}/>
  </SingleCard>
}
