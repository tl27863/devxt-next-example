'use server'
import { redirect } from 'next/navigation'
import defaultUser from '@/utils/default-user';
import { createSession, deleteSession } from '@/app/lib/session'

export async function signUp(email: string, password: string) {
  try {
    // 1. Check if the user exists in the database and return isOk: false if so;
    // 2. Otherwise, add the user to the database.
    console.log(email, password);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to create an account',
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Verify that a user exists
    console.log(email, password);

    await createSession(defaultUser.id);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to sign in',
    }
  }
}

export async function signOut() {
  await deleteSession();
  redirect('/login');
}

export async function changePassword(email: string, recoveryCode?: string) {
  try {
    // Verify the recovery code
    console.log(email, recoveryCode);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to change the password',
    }
  }
}

export async function resetPassword(email: string) {
  try {
    // Reset password
    console.log(email);

    return {
      isOk: true,
    }
  } catch {
    return {
      isOk: false,
      message: 'Unable to reset password',
    }
  }
}
