import React, {useState} from 'react';
import {Button} from './Button'
import './Button.scss';
//import {Link} from 'react-router-dom';

const STYLES = ['btn--primary', 'btn--secondary', 'btn--outline'];
const SIZES  = ['btn--med', 'btn--lg']

export const Dropdown = (props) => {
    
    return (
        <div className='dropdown-container'>
            { props.showSelect ? props.isFriend ?  // if friend: give options to message or remove
                <select>               
                    <option value='Message'>Message</option>
                    <option value='Remove'>Remove Friend</option>
                </select>
                :                          // if not friend: give option to add
                <select>
                    <option value='Add Friend'>Add Friend</option>
                </select> // if showSelect is false: don't show menu}
            : null}                 
        </div>
    )
}
