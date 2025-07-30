import { IP_ADDRESS } from '@env'
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export async function setUser(name: string, email: string, password: string) {
    const response = await fetch(`http://${IP_ADDRESS}:3001/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name, email, password}),
      });
      if (response.ok) {
        console.log("yay")
      } else {
        alert('signup failed');
      }

    return response.json();
}

export async function getUser() {
    const response = await fetch(`http://${IP_ADDRESS}:3001/user/`);
      if (response.ok) {
        console.log("yay")
      } else {
        alert('user fetch failed');
      }

      const json = await response.json();
      return json;
}

export async function loginUser(email: string, password: string) {
    const response = await fetch(`http://${IP_ADDRESS}:3001/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email, password}),
      });

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