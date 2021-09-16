import React from 'react';
import './Button.scss';
//import {Link} from 'react-router-dom';

const STYLES = ['btn--primary', 'btn--secondary', 'btn--outline'];
const SIZES  = ['btn--med', 'btn--lg', 'btn--sm']

export const Button = ({children, type, onClick, buttonStyle, buttonSize, my, mx, classes}) => {
    const getButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0]; // get button style. default to primary
    const getButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];      // get button size. default to medium

    return (
        <button className={`btn ${getButtonSize} ${getButtonStyle} ${my} ${mx} ${classes}`} onClick={onClick} type={type}>
            {children}
        </button>
    )
}
