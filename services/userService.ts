import { IP_ADDRESS } from '@env'
import { useState } from 'react';



export async function getUser(name: string, email: string) {
    const response = await fetch(`http://${IP_ADDRESS}:3001/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name, email}),
      });
      if (response.ok) {
        console.log("yay")
      } else {
        alert('signup failed');
      }

    return response.json();
}