// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState(''); // If needed later, you can split this into lastname/firstname.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    // Use Supabase Auth to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    // Once signed up, insert minimal info into the "users" table
    if (data.user) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          userid: data.user.id,
          gmail: email, // storing email in the 'gmail' field
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      if (insertError) {
        setErrorMsg(insertError.message);
        return;
      }
      console.log('User signed up:', data.user);
      // Navigate to the personal info form page for additional details
      navigate('/user-info');
    }
  };

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <form onSubmit={handleSignup}>
        <label>
          Name:
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </label>
        <label>
          Email:
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </label>
        <label>
          Password:
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;