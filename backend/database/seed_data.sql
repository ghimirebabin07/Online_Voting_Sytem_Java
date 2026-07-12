INSERT INTO election_locations (province, district, municipality)
VALUES
    ('Koshi Province', 'Morang', 'Biratnagar Metropolitan City'),
    ('Koshi Province', 'Udayapur', 'Triyuga Municipality'),
    ('Koshi Province', 'Jhapa', 'Birtamod Municipality'),
    ('Madhesh Province', 'Dhanusha', 'Janakpurdham Sub-Metropolitan City'),
    ('Madhesh Province', 'Parsa', 'Birgunj Metropolitan City'),
    ('Madhesh Province', 'Saptari', 'Rajbiraj Municipality'),
    ('Bagmati Province', 'Kathmandu', 'Kathmandu Metropolitan City'),
    ('Bagmati Province', 'Lalitpur', 'Lalitpur Metropolitan City'),
    ('Bagmati Province', 'Chitwan', 'Bharatpur Metropolitan City'),
    ('Bagmati Province', 'Sindupalchowk', 'Chautara Municipality'),
    ('Gandaki Province', 'Kaski', 'Pokhara Metropolitan City'),
    ('Gandaki Province', 'Gorkha', 'Gorkha Municipality'),
    ('Gandaki Province', 'Syangja', 'Chapakot Municipality'),
    ('Lumbini Province', 'Rupandehi', 'Butwal Sub-Metropolitan City'),
    ('Lumbini Province', 'Palpa', 'Rampur Municipality'),
    ('Lumbini Province', 'Dang', 'Ghorahi Sub-Metropolitan City'),
    ('Karnali Province', 'Surkhet', 'Birendranagar Municipality'),
    ('Karnali Province', 'Jumla', 'Chandannath Municipality'),
    ('Karnali Province', 'Dailekh', 'Narayan Municipality'),
    ('Sudurpashchim Province', 'Kailali', 'Dhangadhi Sub-Metropolitan City'),
    ('Sudurpashchim Province', 'Kanchanpur', 'Bhimdatta Municipality'),
    ('Sudurpashchim Province', 'Dadeldhura', 'Amargadhi Municipality')
ON CONFLICT (province, district, municipality) DO NOTHING;

WITH developer_seed (id, full_name, role_title, bio, skills, image_path, linkedin_url, display_order) AS (
    VALUES
        (1, 'Babin Ghimire', 'Frontend Developer', 'Aspiring software developer focused on building responsive and user-friendly web interfaces.', 'HTML, CSS, JavaScript, UI Design', '/online-voting-backend/Images/babin.jpg', 'https://www.linkedin.com/in/babin-ghimire-91403a32b/', 1),
        (2, 'Sudesh Bhattarai', 'Backend Developer', 'Aspiring software developer working on secure backend systems, database design, and APIs.', 'Java, PostgreSQL, Servlets, REST APIs', '/online-voting-backend/Images/sudesh.jpeg', 'https://www.linkedin.com/in/sudesh-bhattarai-782b52362/', 2)
)
INSERT INTO developers (id, full_name, role_title, bio, skills, image_path, linkedin_url, display_order)
SELECT id, full_name, role_title, bio, skills, image_path, linkedin_url, display_order
FROM developer_seed
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role_title = EXCLUDED.role_title,
    bio = EXCLUDED.bio,
    skills = EXCLUDED.skills,
    image_path = EXCLUDED.image_path,
    linkedin_url = EXCLUDED.linkedin_url,
    display_order = EXCLUDED.display_order;

SELECT setval('developers_id_seq', (SELECT MAX(id) FROM developers));
