const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evento');

// Import compiled models
const Template = require('../dist/models/Template').default;
const TemplateVersion = require('../dist/models/TemplateVersion').default;
const TemplateSection = require('../dist/models/TemplateSection').default;

// Helper to generate IDs
const genId = () => Math.random().toString(36).substr(2, 9);

// Demo user ID
const DEMO_USER_ID = '69413492d29cb31ef9cfd609';

async function createWeddingTemplate() {
  console.log('Creating Elegant Wedding Template...');
  
  const template = await Template.create({
    name: 'Elegant Wedding Invitation',
    slug: 'elegant-wedding-invitation-' + Date.now(),
    description: 'A stunning wedding invitation template with multiple style options - choose from Classic Romance, Modern Minimalist, or Rustic Charm themes.',
    category: 'wedding',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    isActive: true,
    status: 'published',
    createdBy: DEMO_USER_ID
  });

  const version = await TemplateVersion.create({
    templateId: template._id,
    version: 1,
    colorSchemes: [
      { id: 'classic', name: 'Classic Romance', primary: '#8B4557', secondary: '#D4A5A5', accent: '#F5E6E8', background: '#FDF8F8', surface: '#FFFFFF', text: '#2D2D2D', textMuted: '#666666' },
      { id: 'modern', name: 'Modern Minimalist', primary: '#1A1A1A', secondary: '#666666', accent: '#E8E8E8', background: '#FFFFFF', surface: '#F5F5F5', text: '#1A1A1A', textMuted: '#757575' },
      { id: 'rustic', name: 'Rustic Charm', primary: '#6B4423', secondary: '#A67C52', accent: '#D4C4B0', background: '#F5F0EB', surface: '#FFFFFF', text: '#3D3D3D', textMuted: '#666666' }
    ],
    fontPairs: [
      { id: 'elegant', name: 'Elegant Serif', heading: 'Playfair Display', body: 'Lato', headingWeight: 700, bodyWeight: 400 },
      { id: 'modern', name: 'Modern Sans', heading: 'Montserrat', body: 'Open Sans', headingWeight: 700, bodyWeight: 400 }
    ],
    sampleProfiles: [
      { id: 'classic', name: 'Classic Romance', description: 'Traditional elegant wedding with roses and soft colors' },
      { id: 'modern', name: 'Modern Minimalist', description: 'Clean, contemporary wedding with geometric accents' },
      { id: 'rustic', name: 'Rustic Charm', description: 'Outdoor garden wedding with natural elements' }
    ],
    defaultColorScheme: 'classic',
    defaultFontPair: 'elegant',
    defaultSampleProfile: 'classic'
  });

  const sections = [
    {
      sectionId: 'sec_' + genId(),
      type: 'hero',
      name: 'Wedding Hero',
      order: 0,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'groomName', type: 'text', label: 'Groom Name', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'brideName', type: 'text', label: 'Bride Name', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'tagline', type: 'text', label: 'Tagline' },
        { fieldId: 'fld_' + genId(), key: 'weddingDate', type: 'date', label: 'Wedding Date', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'heroImage', type: 'image', label: 'Hero Image' }
      ],
      sampleValues: { groomName: 'James', brideName: 'Elizabeth', tagline: 'Two Hearts, One Love', weddingDate: '2026-06-15', heroImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920&q=90' },
      sampleDataSets: [
        { profileId: 'classic', values: { groomName: 'James', brideName: 'Elizabeth', tagline: 'Two Hearts, One Love', weddingDate: '2026-06-15', heroImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920&q=90' } },
        { profileId: 'modern', values: { groomName: 'Alex', brideName: 'Jordan', tagline: 'Forever Starts Now', weddingDate: '2026-08-20', heroImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=90' } },
        { profileId: 'rustic', values: { groomName: 'William', brideName: 'Sophie', tagline: 'Love Grows Here', weddingDate: '2026-05-10', heroImage: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1920&q=90' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'countdown',
      name: 'Wedding Countdown',
      order: 1,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'targetDate', type: 'datetime', label: 'Wedding Date & Time', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'message', type: 'text', label: 'Countdown Message' }
      ],
      sampleValues: { targetDate: '2026-06-15T16:00:00', message: 'Until We Say I Do' },
      sampleDataSets: [
        { profileId: 'classic', values: { targetDate: '2026-06-15T16:00:00', message: 'Until We Say I Do' } },
        { profileId: 'modern', values: { targetDate: '2026-08-20T18:00:00', message: 'The Countdown Begins' } },
        { profileId: 'rustic', values: { targetDate: '2026-05-10T15:00:00', message: 'Days Until Forever' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'story',
      name: 'Our Story',
      order: 2,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'Section Title' },
        { fieldId: 'fld_' + genId(), key: 'story', type: 'textarea', label: 'Your Story' },
        { fieldId: 'fld_' + genId(), key: 'storyImage', type: 'image', label: 'Story Image' }
      ],
      sampleValues: { title: 'Our Love Story', story: 'We met at a coffee shop on a rainy afternoon...', storyImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800' },
      sampleDataSets: [
        { profileId: 'classic', values: { title: 'Our Love Story', story: 'We met at a coffee shop on a rainy afternoon. What started as a chance encounter became the greatest adventure of our lives. Three years later, here we are, ready to begin our forever.', storyImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800' } },
        { profileId: 'modern', values: { title: 'How We Met', story: 'A mutual friend introduced us at a rooftop party in the city. We talked until sunrise and knew something special had begun.', storyImage: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800' } },
        { profileId: 'rustic', values: { title: 'Our Journey', story: 'We fell in love hiking through the mountains. Nature brought us together, and now we celebrate our love surrounded by the beauty that first united us.', storyImage: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'event_details',
      name: 'Wedding Details',
      order: 3,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'ceremonyTime', type: 'text', label: 'Ceremony Time', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'receptionTime', type: 'text', label: 'Reception Time' },
        { fieldId: 'fld_' + genId(), key: 'dressCode', type: 'text', label: 'Dress Code' },
        { fieldId: 'fld_' + genId(), key: 'additionalInfo', type: 'textarea', label: 'Additional Information' }
      ],
      sampleValues: { ceremonyTime: '4:00 PM', receptionTime: '6:00 PM - 11:00 PM', dressCode: 'Black Tie Optional', additionalInfo: 'Dinner and dancing to follow the ceremony' },
      sampleDataSets: [
        { profileId: 'classic', values: { ceremonyTime: '4:00 PM', receptionTime: '6:00 PM - 11:00 PM', dressCode: 'Black Tie Optional', additionalInfo: 'Dinner and dancing to follow the ceremony. Valet parking available.' } },
        { profileId: 'modern', values: { ceremonyTime: '6:00 PM', receptionTime: '7:30 PM - Midnight', dressCode: 'Cocktail Attire', additionalInfo: 'Rooftop ceremony followed by dinner and DJ.' } },
        { profileId: 'rustic', values: { ceremonyTime: '3:00 PM', receptionTime: '5:00 PM - 10:00 PM', dressCode: 'Garden Party Attire', additionalInfo: 'Outdoor ceremony - comfortable shoes recommended. BBQ dinner and live band.' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'venue',
      name: 'Wedding Venue',
      order: 4,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'venueName', type: 'text', label: 'Venue Name', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'address', type: 'textarea', label: 'Address', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'venueImage', type: 'image', label: 'Venue Image' },
        { fieldId: 'fld_' + genId(), key: 'mapUrl', type: 'url', label: 'Map URL' },
        { fieldId: 'fld_' + genId(), key: 'directions', type: 'textarea', label: 'Directions' }
      ],
      sampleValues: { venueName: 'The Grand Ballroom', address: '123 Elegant Avenue, Beverly Hills, CA 90210', venueImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', directions: 'Located in the heart of Beverly Hills' },
      sampleDataSets: [
        { profileId: 'classic', values: { venueName: 'The Grand Ballroom', address: '123 Elegant Avenue, Beverly Hills, CA 90210', venueImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', directions: 'Located in the heart of Beverly Hills. Valet parking available.' } },
        { profileId: 'modern', values: { venueName: 'Skyline Rooftop', address: '500 Downtown Plaza, Los Angeles, CA 90012', venueImage: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200', directions: 'Take the elevator to the 50th floor.' } },
        { profileId: 'rustic', values: { venueName: 'Willow Creek Farm', address: '789 Country Road, Malibu, CA 90265', venueImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200', directions: 'Follow the signs from Pacific Coast Highway.' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'gallery',
      name: 'Photo Gallery',
      order: 5,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'Gallery Title' },
        { fieldId: 'fld_' + genId(), key: 'images', type: 'gallery', label: 'Gallery Images' }
      ],
      sampleValues: { title: 'Our Moments', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800'] },
      sampleDataSets: [
        { profileId: 'classic', values: { title: 'Our Moments', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800'] } },
        { profileId: 'modern', values: { title: 'Captured Love', images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'] } },
        { profileId: 'rustic', values: { title: 'Love in Nature', images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800'] } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'rsvp',
      name: 'RSVP',
      order: 6,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'RSVP Title' },
        { fieldId: 'fld_' + genId(), key: 'message', type: 'textarea', label: 'RSVP Message' },
        { fieldId: 'fld_' + genId(), key: 'deadline', type: 'date', label: 'RSVP Deadline' }
      ],
      sampleValues: { title: 'RSVP', message: 'Please let us know if you can join us on our special day.', deadline: '2026-05-15' },
      sampleDataSets: [
        { profileId: 'classic', values: { title: 'Kindly Respond', message: 'We would be honored by your presence.', deadline: '2026-05-15' } },
        { profileId: 'modern', values: { title: 'RSVP', message: 'Let us know you are coming!', deadline: '2026-07-20' } },
        { profileId: 'rustic', values: { title: 'Will You Join Us?', message: 'We would love to have you celebrate with us under the open sky.', deadline: '2026-04-10' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'wishes',
      name: 'Wedding Wishes',
      order: 7,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'Wishes Title' },
        { fieldId: 'fld_' + genId(), key: 'description', type: 'textarea', label: 'Description' }
      ],
      sampleValues: { title: 'Send Your Wishes', description: 'Leave a message for the happy couple!' },
      sampleDataSets: [
        { profileId: 'classic', values: { title: 'Send Your Wishes', description: 'Share your blessings and well wishes for the newlyweds.' } },
        { profileId: 'modern', values: { title: 'Leave a Message', description: 'Drop us a note - we would love to hear from you!' } },
        { profileId: 'rustic', values: { title: 'Guestbook', description: 'Write your wishes for our new adventure together.' } }
      ]
    }
  ];

  for (const section of sections) {
    await TemplateSection.create({ versionId: version._id, ...section });
  }

  console.log('Wedding template created:', template._id);
  return template;
}

async function createBirthdayTemplate() {
  console.log('Creating Fun Birthday Template...');
  
  const template = await Template.create({
    name: 'Fun Birthday Bash',
    slug: 'fun-birthday-bash-' + Date.now(),
    description: 'A vibrant birthday party template with themes for Kids Party, Teen Celebration, and Adult Milestone birthdays.',
    category: 'birthday',
    thumbnail: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800',
    isActive: true,
    status: 'published',
    createdBy: DEMO_USER_ID
  });

  const version = await TemplateVersion.create({
    templateId: template._id,
    version: 1,
    colorSchemes: [
      { id: 'kids', name: 'Kids Party', primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D', background: '#FFF9F0', surface: '#FFFFFF', text: '#2D3436', textMuted: '#636E72' },
      { id: 'teen', name: 'Teen Vibes', primary: '#6C5CE7', secondary: '#A29BFE', accent: '#FD79A8', background: '#F8F9FA', surface: '#FFFFFF', text: '#2D3436', textMuted: '#636E72' },
      { id: 'milestone', name: 'Golden Milestone', primary: '#D4AF37', secondary: '#1A1A2E', accent: '#F5E6CC', background: '#FFFEF7', surface: '#FFFFFF', text: '#1A1A2E', textMuted: '#4A4A4A' }
    ],
    fontPairs: [
      { id: 'playful', name: 'Playful', heading: 'Fredoka One', body: 'Nunito', headingWeight: 700, bodyWeight: 400 },
      { id: 'elegant', name: 'Elegant', heading: 'Cormorant Garamond', body: 'Raleway', headingWeight: 700, bodyWeight: 400 }
    ],
    sampleProfiles: [
      { id: 'kids', name: 'Kids Party', description: 'Colorful and fun party for children' },
      { id: 'teen', name: 'Teen Celebration', description: 'Cool and trendy party for teenagers' },
      { id: 'milestone', name: 'Golden Milestone', description: 'Elegant celebration for milestone birthdays' }
    ],
    defaultColorScheme: 'kids',
    defaultFontPair: 'playful',
    defaultSampleProfile: 'kids'
  });

  const sections = [
    {
      sectionId: 'sec_' + genId(),
      type: 'hero',
      name: 'Birthday Hero',
      order: 0,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'name', type: 'text', label: 'Birthday Person Name', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'age', type: 'number', label: 'Turning Age', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'tagline', type: 'text', label: 'Party Tagline' },
        { fieldId: 'fld_' + genId(), key: 'partyDate', type: 'date', label: 'Party Date', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'heroImage', type: 'image', label: 'Hero Image' }
      ],
      sampleValues: { name: 'Lily', age: 6, tagline: 'Let the Magic Begin!', partyDate: '2026-04-12', heroImage: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1920&q=90' },
      sampleDataSets: [
        { profileId: 'kids', values: { name: 'Lily', age: 6, tagline: 'Let the Magic Begin!', partyDate: '2026-04-12', heroImage: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1920&q=90' } },
        { profileId: 'teen', values: { name: 'Maya', age: 16, tagline: 'Sweet Sixteen!', partyDate: '2026-07-22', heroImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=90' } },
        { profileId: 'milestone', values: { name: 'Robert', age: 50, tagline: 'Fifty and Fabulous', partyDate: '2026-09-05', heroImage: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1920&q=90' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'countdown',
      name: 'Party Countdown',
      order: 1,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'targetDate', type: 'datetime', label: 'Party Date & Time', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'message', type: 'text', label: 'Countdown Message' }
      ],
      sampleValues: { targetDate: '2026-04-12T14:00:00', message: 'The party starts in...' },
      sampleDataSets: [
        { profileId: 'kids', values: { targetDate: '2026-04-12T14:00:00', message: 'The party starts in...' } },
        { profileId: 'teen', values: { targetDate: '2026-07-22T19:00:00', message: 'Get ready to party!' } },
        { profileId: 'milestone', values: { targetDate: '2026-09-05T18:00:00', message: 'The celebration begins in...' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'event_details',
      name: 'Party Details',
      order: 2,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'partyTime', type: 'text', label: 'Party Time', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'theme', type: 'text', label: 'Party Theme' },
        { fieldId: 'fld_' + genId(), key: 'dressCode', type: 'text', label: 'Dress Code' },
        { fieldId: 'fld_' + genId(), key: 'activities', type: 'textarea', label: 'Activities' }
      ],
      sampleValues: { partyTime: '2:00 PM - 5:00 PM', theme: 'Unicorn Rainbow', dressCode: 'Wear your favorite colors!', activities: 'Games, face painting, and cake!' },
      sampleDataSets: [
        { profileId: 'kids', values: { partyTime: '2:00 PM - 5:00 PM', theme: 'Unicorn Rainbow', dressCode: 'Wear your favorite colors!', activities: 'Games, face painting, bouncy castle, and cake!' } },
        { profileId: 'teen', values: { partyTime: '7:00 PM - 11:00 PM', theme: 'Neon Glow Party', dressCode: 'Wear white or neon colors', activities: 'DJ, photo booth, karaoke, and pizza!' } },
        { profileId: 'milestone', values: { partyTime: '6:00 PM - 10:00 PM', theme: 'Golden Celebration', dressCode: 'Cocktail Attire', activities: 'Live music, gourmet dinner, and champagne toast!' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'venue',
      name: 'Party Location',
      order: 3,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'venueName', type: 'text', label: 'Venue Name', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'address', type: 'textarea', label: 'Address', validation: { required: true } },
        { fieldId: 'fld_' + genId(), key: 'venueImage', type: 'image', label: 'Venue Image' },
        { fieldId: 'fld_' + genId(), key: 'directions', type: 'textarea', label: 'Directions' }
      ],
      sampleValues: { venueName: 'Fun Zone Party Center', address: '456 Party Lane, Los Angeles, CA 90028', venueImage: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200', directions: 'Located next to the mall.' },
      sampleDataSets: [
        { profileId: 'kids', values: { venueName: 'Fun Zone Party Center', address: '456 Party Lane, Los Angeles, CA 90028', venueImage: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200', directions: 'Located next to the mall. Look for the rainbow balloons!' } },
        { profileId: 'teen', values: { venueName: 'The Loft Lounge', address: '789 Downtown Ave, Los Angeles, CA 90015', venueImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200', directions: 'Third floor of the Arts Building.' } },
        { profileId: 'milestone', values: { venueName: 'The Grand Estate', address: '100 Luxury Drive, Beverly Hills, CA 90210', venueImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200', directions: 'Valet parking available.' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'gallery',
      name: 'Party Gallery',
      order: 4,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'Gallery Title' },
        { fieldId: 'fld_' + genId(), key: 'images', type: 'gallery', label: 'Gallery Images' }
      ],
      sampleValues: { title: 'Party Memories', images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800'] },
      sampleDataSets: [
        { profileId: 'kids', values: { title: 'Party Memories', images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800'] } },
        { profileId: 'teen', values: { title: 'Epic Moments', images: ['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', 'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=800'] } },
        { profileId: 'milestone', values: { title: 'Golden Memories', images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'] } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'rsvp',
      name: 'Party RSVP',
      order: 5,
      isRequired: true,
      canDisable: false,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'RSVP Title' },
        { fieldId: 'fld_' + genId(), key: 'message', type: 'textarea', label: 'RSVP Message' },
        { fieldId: 'fld_' + genId(), key: 'deadline', type: 'date', label: 'RSVP Deadline' }
      ],
      sampleValues: { title: 'Join the Party!', message: 'We would love to have you celebrate with us!', deadline: '2026-04-05' },
      sampleDataSets: [
        { profileId: 'kids', values: { title: 'Join the Party!', message: 'We would love to have you celebrate with us!', deadline: '2026-04-05' } },
        { profileId: 'teen', values: { title: 'You are Invited!', message: 'It would not be the same without you!', deadline: '2026-07-15' } },
        { profileId: 'milestone', values: { title: 'Please Join Us', message: 'Your presence would make this milestone celebration complete.', deadline: '2026-08-25' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'wishes',
      name: 'Birthday Wishes',
      order: 6,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'Wishes Title' },
        { fieldId: 'fld_' + genId(), key: 'description', type: 'textarea', label: 'Description' }
      ],
      sampleValues: { title: 'Send Birthday Wishes', description: 'Leave a special birthday message!' },
      sampleDataSets: [
        { profileId: 'kids', values: { title: 'Send Birthday Wishes', description: 'Leave a special birthday message for Lily!' } },
        { profileId: 'teen', values: { title: 'Drop a Message', description: 'Write something cool for Maya!' } },
        { profileId: 'milestone', values: { title: 'Share Your Wishes', description: 'Leave your heartfelt wishes for Robert on this special milestone.' } }
      ]
    },
    {
      sectionId: 'sec_' + genId(),
      type: 'gift_registry',
      name: 'Gift Ideas',
      order: 7,
      isRequired: false,
      canDisable: true,
      fields: [
        { fieldId: 'fld_' + genId(), key: 'title', type: 'text', label: 'Title' },
        { fieldId: 'fld_' + genId(), key: 'message', type: 'textarea', label: 'Message' }
      ],
      sampleValues: { title: 'Gift Ideas', message: 'Your presence is the best gift!' },
      sampleDataSets: [
        { profileId: 'kids', values: { title: 'Gift Ideas', message: 'Your presence is the best gift! But if you would like to bring something, Lily loves unicorns, art supplies, and books.' } },
        { profileId: 'teen', values: { title: 'Gift Guide', message: 'No gifts necessary! But if you insist, Maya loves music, tech gadgets, and gift cards.' } },
        { profileId: 'milestone', values: { title: 'In Lieu of Gifts', message: 'Your presence is gift enough. If you wish to give, please consider a donation to the local food bank.' } }
      ]
    }
  ];

  for (const section of sections) {
    await TemplateSection.create({ versionId: version._id, ...section });
  }

  console.log('Birthday template created:', template._id);
  return template;
}

async function main() {
  try {
    console.log('Starting template creation...');
    const wedding = await createWeddingTemplate();
    const birthday = await createBirthdayTemplate();
    console.log('\n=== Templates Created Successfully ===');
    console.log('Wedding Template ID:', wedding._id);
    console.log('Birthday Template ID:', birthday._id);
    process.exit(0);
  } catch (error) {
    console.error('Error creating templates:', error);
    process.exit(1);
  }
}

main();
