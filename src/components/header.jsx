import { NavLink } from 'react-router-dom'

export default function Header() {
    return (
        <header>
            <img src={`${import.meta.env.BASE_URL}logosvg.svg`} alt="logo" className="logo" />
            <div className="chosepage">
                <nav>
                    <NavLink end className={({ isActive }) => isActive ? 'linktohomepage activepage' : 'linktohomepage'} to="/">
                        HomePage
                    </NavLink>
                    <NavLink className={({ isActive }) => isActive ? 'linktotierspage activepage' : 'linktotierspage'} to="/tiers">
                        Tiers
                    </NavLink>
                </nav>
            </div>
        </header>
    )
}