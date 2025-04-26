# Holidaze - Venue Booking Platform

![Holidaze Screenshot](./screenshots/homepage.png)

## Overview

Holidaze is a modern venue booking platform that allows users to browse, book, and manage venues. The application provides a seamless experience for both customers looking to book venues and venue managers who want to list and manage their properties.

## Features

- **User Authentication**: Register and login with Noroff student credentials
- **Venue Browsing**: Search and filter through available venues
- **Venue Details**: View comprehensive information about each venue
- **Booking System**: Book venues for specific dates
- **Venue Management**: Create, edit, and delete venues (for venue managers)
- **Profile Management**: Update profile information and view bookings
- **Responsive Design**: Fully responsive interface that works on mobile, tablet, and desktop

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **API Integration**: Noroff API
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A Noroff student account for API access

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/holidaze.git
   cd holidaze
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_API_BASE_URL=https://api.noroff.dev/api/v1
   NEXT_PUBLIC_API_KEY=your_noroff_api_key
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### For Customers

1. Browse venues on the homepage
2. Use the search functionality to find specific venues
3. Click on a venue to view details
4. Register or login to book a venue
5. Select dates and complete the booking process
6. View your bookings in your profile

### For Venue Managers

1. Register as a venue manager or update your profile to become one
2. Create new venues from your profile page
3. Manage your venues (edit, delete) from your profile
4. View bookings for your venues

## API Documentation

This project uses the Noroff API for all data operations. The API requires:

- A valid Noroff student email for registration
- API key for all requests
- JWT token for authenticated requests

For more information about the API, visit [Noroff API Documentation](https://docs.noroff.dev).

## Project Structure

\`\`\`
holidaze/
├── app/                  # Next.js app directory
│   ├── api/              # API utilities and configurations
│   ├── components/       # React components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── ...               # Page routes
├── components/           # Shared UI components
│   └── ui/               # shadcn/ui components
├── public/               # Static assets
└── ...                   # Configuration files
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Noroff School of Technology for providing the API
- All contributors who have helped shape this project
