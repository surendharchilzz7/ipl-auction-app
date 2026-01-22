// Hardcoded data for defunct teams where scraping fails (e.g. iplt20.com removes them)

const FALLBACK_DATA = {
    2008: [
        // Deccan Chargers 2008
        { name: "Adam Gilchrist", team: "DEC", role: "WK", price: 2.8 },
        { name: "VVS Laxman", team: "DEC", role: "BAT", price: 1.5 },
        { name: "Herschelle Gibbs", team: "DEC", role: "BAT", price: 2.3 },
        { name: "Rohit Sharma", team: "DEC", role: "BAT", price: 3.0 },
        { name: "Andrew Symonds", team: "DEC", role: "AR", price: 5.4 },
        { name: "Shahid Afridi", team: "DEC", role: "AR", price: 2.7 },
        { name: "Scott Styris", team: "DEC", role: "AR", price: 0.7 },
        { name: "RP Singh", team: "DEC", role: "BOWL", price: 3.5 },
        { name: "Chaminda Vaas", team: "DEC", role: "BOWL", price: 0.8 },
        { name: "Pragyan Ojha", team: "DEC", role: "BOWL", price: 1.0 },
        { name: "Sanjay Bangar", team: "DEC", role: "AR", price: 1.0 },
        { name: "Venugopal Rao", team: "DEC", role: "BAT", price: 1.0 },
        { name: "Arjun Yadav", team: "DEC", role: "BAT", price: 0.5 },
        { name: "Dwaraka Ravi Teja", team: "DEC", role: "BAT", price: 0.5 },
        { name: "Halhadar Das", team: "DEC", role: "WK", price: 0.2 },
        { name: "Nuwan Zoysa", team: "DEC", role: "BOWL", price: 0.5 },
        { name: "Chamara Silva", team: "DEC", role: "BAT", price: 0.5 },
        { name: "D Kalyankrishna", team: "DEC", role: "BOWL", price: 0.2 },
        { name: "Vijaykumar", team: "DEC", role: "BOWL", price: 0.2 },
        { name: "PM Sarvesh Kumar", team: "DEC", role: "BOWL", price: 0.2 }
    ],
    2009: [
        // Deccan Chargers 2009 (Champions)
        { name: "Adam Gilchrist", team: "DEC", role: "WK", price: 2.8 },
        { name: "Herschelle Gibbs", team: "DEC", role: "BAT", price: 2.3 },
        { name: "Andrew Symonds", team: "DEC", role: "AR", price: 5.4 },
        { name: "Rohit Sharma", team: "DEC", role: "BAT", price: 3.0 },
        { name: "RP Singh", team: "DEC", role: "BOWL", price: 3.5 },
        { name: "Pragyan Ojha", team: "DEC", role: "BOWL", price: 1.0 },
        { name: "Ryan Harris", team: "DEC", role: "BOWL", price: 1.0 },
        { name: "Tirumalasetti Suman", team: "DEC", role: "BAT", price: 0.5 },
        { name: "Venugopal Rao", team: "DEC", role: "BAT", price: 1.0 },
        { name: "Fidel Edwards", team: "DEC", role: "BOWL", price: 0.5 },
        { name: "Dwaraka Ravi Teja", team: "DEC", role: "BAT", price: 0.5 },
        { name: "Harmeet Singh", team: "DEC", role: "BOWL", price: 0.2 },
        { name: "Azhar Bilakhia", team: "DEC", role: "BAT", price: 0.2 },
        { name: "Shoaib Ahmed", team: "DEC", role: "BOWL", price: 0.2 },
        { name: "Jaskaran Singh", team: "DEC", role: "BOWL", price: 0.2 }
    ],
    2010: [
        // Deccan Chargers 2010
        { name: "Adam Gilchrist", team: "DEC", role: "WK", price: 2.8 },
        { name: "Andrew Symonds", team: "DEC", role: "AR", price: 5.4 },
        { name: "Rohit Sharma", team: "DEC", role: "BAT", price: 3.0 },
        { name: "Herschelle Gibbs", team: "DEC", role: "BAT", price: 2.0 },
        { name: "Mitchell Marsh", team: "DEC", role: "AR", price: 1.0 },
        { name: "Kemar Roach", team: "DEC", role: "BOWL", price: 3.0 },
        { name: "Pragyan Ojha", team: "DEC", role: "BOWL", price: 1.0 },
        { name: "RP Singh", team: "DEC", role: "BOWL", price: 3.0 },
        { name: "Ryan Harris", team: "DEC", role: "BOWL", price: 1.0 },
        { name: "Tirumalasetti Suman", team: "DEC", role: "BAT", price: 0.8 },
        { name: "Rahul Sharma", team: "DEC", role: "BOWL", price: 0.5 },
        { name: "Monish Mishra", team: "DEC", role: "BAT", price: 0.2 },
        { name: "Harmeet Singh", team: "DEC", role: "BOWL", price: 0.2 }
    ],
    2011: [
        // Deccan Chargers 2011
        { name: "Kumar Sangakkara", team: "DEC", role: "WK", price: 3.0 },
        { name: "Dale Steyn", team: "DEC", role: "BOWL", price: 5.5 },
        { name: "Cameron White", team: "DEC", role: "BAT", price: 5.0 },
        { name: "Jean-Paul Duminy", team: "DEC", role: "BAT", price: 1.5 },
        { name: "Shikhar Dhawan", team: "DEC", role: "BAT", price: 1.5 },
        { name: "Ishant Sharma", team: "DEC", role: "BOWL", price: 2.0 },
        { name: "Amit Mishra", team: "DEC", role: "BOWL", price: 2.0 },
        { name: "Daniel Christian", team: "DEC", role: "AR", price: 4.0 },
        { name: "Pragyan Ojha", team: "DEC", role: "BOWL", price: 2.0 }, // Wait, moved to MI? Checking.
        { name: "Bharat Chipli", team: "DEC", role: "BAT", price: 0.2 },
        { name: "Dwaraka Ravi Teja", team: "DEC", role: "BAT", price: 0.2 },
        { name: "Ashish Reddy", team: "DEC", role: "AR", price: 0.2 },

        // Kochi Tuskers Kerala 2011
        { name: "Mahela Jayawardene", team: "KTK", role: "BAT", price: 6.5 },
        { name: "Brendon McCullum", team: "KTK", role: "WK", price: 2.0 },
        { name: "Ravindra Jadeja", team: "KTK", role: "AR", price: 4.0 },
        { name: "Muttiah Muralitharan", team: "KTK", role: "BOWL", price: 5.0 },
        { name: "Brad Hodge", team: "KTK", role: "BAT", price: 2.0 },
        { name: "VVS Laxman", team: "KTK", role: "BAT", price: 2.0 },
        { name: "Sreesanth", team: "KTK", role: "BOWL", price: 4.0 },
        { name: "RP Singh", team: "KTK", role: "BOWL", price: 2.0 },
        { name: "Parthiv Patel", team: "KTK", role: "WK", price: 1.5 },
        { name: "Thisara Perera", team: "KTK", role: "AR", price: 0.5 },
        { name: "Steve Smith", team: "KTK", role: "BAT", price: 1.0 },
        { name: "Ramesh Powar", team: "KTK", role: "BOWL", price: 1.0 },

        // Pune Warriors India 2011
        { name: "Yuvraj Singh", team: "PWI", role: "AR", price: 8.0 },
        { name: "Robin Uthappa", team: "PWI", role: "WK", price: 9.5 },
        { name: "Graeme Smith", team: "PWI", role: "BAT", price: 2.0 },
        { name: "Angelo Mathews", team: "PWI", role: "AR", price: 4.0 },
        { name: "Jesse Ryder", team: "PWI", role: "AR", price: 0.5 },
        { name: "Wayne Parnell", team: "PWI", role: "BOWL", price: 0.5 },
        { name: "Murali Kartik", team: "PWI", role: "BOWL", price: 3.0 },
        { name: "Ashish Nehra", team: "PWI", role: "BOWL", price: 3.5 },
        { name: "Manish Pandey", team: "PWI", role: "BAT", price: 1.0 },
        { name: "Rahul Sharma", team: "PWI", role: "BOWL", price: 0.5 },
        { name: "Mithun Manhas", team: "PWI", role: "BAT", price: 0.5 }
    ],
    2012: [
        // Deccan Chargers 2012
        { name: "Kumar Sangakkara", team: "DEC", role: "WK", price: 3.0 },
        { name: "Dale Steyn", team: "DEC", role: "BOWL", price: 5.5 },
        { name: "Shikhar Dhawan", team: "DEC", role: "BAT", price: 2.0 },
        { name: "Cameron White", team: "DEC", role: "BAT", price: 5.0 },
        { name: "Daniel Christian", team: "DEC", role: "AR", price: 4.0 },
        { name: "Amit Mishra", team: "DEC", role: "BOWL", price: 2.0 },
        { name: "Parthiv Patel", team: "DEC", role: "WK", price: 2.0 },
        { name: "Jean-Paul Duminy", team: "DEC", role: "BAT", price: 2.0 },
        { name: "Manpreet Gony", team: "DEC", role: "BOWL", price: 1.5 },

        // Pune Warriors India 2012
        { name: "Sourav Ganguly", team: "PWI", role: "BAT", price: 2.0 },
        { name: "Michael Clarke", team: "PWI", role: "BAT", price: 2.0 },
        { name: "Steve Smith", team: "PWI", role: "BAT", price: 1.0 },
        { name: "Marlon Samuels", team: "PWI", role: "AR", price: 1.0 },
        { name: "Robin Uthappa", team: "PWI", role: "WK", price: 9.5 },
        { name: "Yuvraj Singh", team: "PWI", role: "AR", price: 8.0 }, // Missed season but in squad list
        { name: "Angelo Mathews", team: "PWI", role: "AR", price: 4.0 },
        { name: "Ashok Dinda", team: "PWI", role: "BOWL", price: 2.5 },
        { name: "Bhuvneshwar Kumar", team: "PWI", role: "BOWL", price: 1.0 },
        { name: "Rahul Sharma", team: "PWI", role: "BOWL", price: 1.0 }
    ],
    2013: [
        // Pune Warriors India 2013
        { name: "Angelo Mathews", team: "PWI", role: "AR", price: 4.0 },
        { name: "Yuvraj Singh", team: "PWI", role: "AR", price: 8.0 },
        { name: "Steve Smith", team: "PWI", role: "BAT", price: 2.0 },
        { name: "Ross Taylor", team: "PWI", role: "BAT", price: 4.0 },
        { name: "Aaron Finch", team: "PWI", role: "BAT", price: 2.0 },
        { name: "Robin Uthappa", team: "PWI", role: "WK", price: 9.5 },
        { name: "Bhuvneshwar Kumar", team: "PWI", role: "BOWL", price: 2.0 },
        { name: "Ashok Dinda", team: "PWI", role: "BOWL", price: 2.5 },
        { name: "Mitchell Marsh", team: "PWI", role: "AR", price: 1.5 },
        { name: "Manish Pandey", team: "PWI", role: "BAT", price: 2.0 },
        { name: "Parveez Rasool", team: "PWI", role: "AR", price: 0.5 }
    ]
};

module.exports = FALLBACK_DATA;
