// src/pages/user/GoogleCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_DOMAIN } from '../../config.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { search } = useLocation();
  console.log('Browser URL on callback:', window.location.href);
  console.log('Query params:', new URLSearchParams(window.location.search).toString());


  useEffect(() => {
    const params     = new URLSearchParams(search);
    const credential = params.get('credential');
    const state      = params.get('state') || '/';

    if (!credential) {
      // handle error…
      return;
    }

    fetch(`${API_DOMAIN}/auth/google`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token: credential }),
    })
      .then(r => r.json())
      .then(data => {
        login(data);
        navigate(state, { replace: true });
      })
      .catch(err => {
        console.error(err);
        // show error…
      });
  }, [search]);

  return <p>登入中…</p>;
}
