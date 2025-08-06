import { IP_ADDRESS, PORT } from '@env'
import { useState, useContext } from 'react';
import { apiCall, storeRefreshToken, storeToken } from './authService';

export async function setUser(name: string, email: string, password: string) {
  // const response = await apiCall(`user/`, 'POST');
    const response = await fetch(`http://${IP_ADDRESS}:${PORT}/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name, email, password}),
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert('Signup failed: ' + (errorData.message || 'Unknown error'));
        return null;
      }
      
      const data = await response.json();
      console.log("Signup success:", data);
      return data;
      
}

// export async function getUser() {
//     const response = await fetch(`http://${IP_ADDRESS}:3001/user/`);
//       if (response.ok) {
//         console.log("yay")
//       } else {
//         alert('user fetch failed');
//       }

//       const json = await response.json();
//       return json;
// }

export async function loginUser(email: string, password: string) {
  const response = await apiCall(`user/login`, 'POST')
    // const response = await apiCall(`http://${IP_ADDRESS}:${PORT}/user/login`);
      // const response = await apiCall(`http://${IP_ADDRESS}:3001/user/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({email, password}),
      // });

      if (!response.ok) {
        throw new Error("invalid login")
      } 

    const data = await response.json();
    // setAuthState({
    //   token: data.token,
    //   authenticated: true
    // })

    return data;
};