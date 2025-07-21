import { IP_ADDRESS } from '@env'
import { useState } from 'react';



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

    return response.json();
}

export async function loginUser(email: string, password: string) {
    const response = await fetch(`http://${IP_ADDRESS}:3001/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email, password}),
      });
      if (!response.ok) {
        throw new Error("invalid login")
      } 

    return response.json();
}