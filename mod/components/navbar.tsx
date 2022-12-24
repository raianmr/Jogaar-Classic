import Link from "next/link"
import { clearStore } from "../data/store"

export default function Navbar() {
  return (
    <div>
      <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Jogaar Moderation
          </a>
          <div>
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <Link className="nav-link" href="/modmins">
                  modmins
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/campaigns">
                  campaigns
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/reports">
                  reports
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link"
                  href="/login"
                  onClick={() => clearStore()}>
                  Reset
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}
