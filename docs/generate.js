// Simple docs generator: creates PPTX (pptxgenjs) and PDF (pdfkit)
// Outputs to ./output

const fs = require('fs');
const path = require('path');
const PPTXGenJS = require('pptxgenjs');
const PDFDocument = require('pdfkit');

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function createPptx(outDir) {
	const pptx = new PPTXGenJS();
	const titleSlide = pptx.addSlide();
	titleSlide.addText('Classroom Management System', { x: 0.5, y: 1.0, w: 9.0, fontSize: 36, bold: true });
	titleSlide.addText('Overview & Architecture', { x: 0.5, y: 2.1, w: 9.0, fontSize: 20, color: '666666' });

	const stackSlide = pptx.addSlide();
	stackSlide.addText('Tech Stack', { x: 0.5, y: 0.5, fontSize: 28, bold: true });
	stackSlide.addText(
		[
			{ text: 'Frontend: ', options: { bold: true } },
			{ text: 'React, Vite, React Router, MUI' },
			{ text: '\nAPI: ', options: { bold: true } },
			{ text: 'Node.js, Express, Prisma, Zod, JWT' },
			{ text: '\nDatabase: ', options: { bold: true } },
			{ text: 'SQLite (dev) / PostgreSQL (prod)' },
			{ text: '\nServices: ', options: { bold: true } },
			{ text: 'Face service (Python), Admin panel (Django scaffold)' },
		],
		{ x: 0.5, y: 1.2, w: 9.0, fontSize: 18 }
	);

    const featuresSlide = pptx.addSlide();
    featuresSlide.addText('Key Features', { x: 0.5, y: 0.5, fontSize: 28, bold: true });
    featuresSlide.addText(
        [
            { text: 'Authentication (JWT), role-based access', options: { bullet: true } },
            { text: 'Role dashboards: Student, Teacher, Admin', options: { bullet: true } },
            { text: 'Classes, Materials, Attendance routes', options: { bullet: true } },
            { text: 'Protected routes in frontend', options: { bullet: true } },
        ],
        { x: 0.5, y: 1.2, w: 9.0, fontSize: 18 }
    );

	const archSlide = pptx.addSlide();
	archSlide.addText('Architecture (Simple Diagram)', { x: 0.5, y: 0.5, fontSize: 28, bold: true });
	// Boxes
	archSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 3.0, h: 1.0, fill: { color: 'DDEEFF' }, line: { color: '4472C4' } });
	archSlide.addText('Frontend\n(React + Vite)', { x: 0.5, y: 1.5, w: 3.0, h: 1.0, align: 'center', fontSize: 16 });
	archSlide.addShape(pptx.ShapeType.rect, { x: 4.0, y: 1.5, w: 3.0, h: 1.0, fill: { color: 'E2F0D9' }, line: { color: '548235' } });
	archSlide.addText('API\n(Express + Prisma)', { x: 4.0, y: 1.5, w: 3.0, h: 1.0, align: 'center', fontSize: 16 });
	archSlide.addShape(pptx.ShapeType.rect, { x: 7.5, y: 1.5, w: 2.0, h: 1.0, fill: { color: 'FFF2CC' }, line: { color: 'BF8F00' } });
	archSlide.addText('DB', { x: 7.5, y: 1.5, w: 2.0, h: 1.0, align: 'center', fontSize: 16 });
	// Arrows
	archSlide.addShape(pptx.ShapeType.line, { x: 3.5, y: 2.0, w: 0.5, h: 0, line: { color: '000000', width: 2 } });
	archSlide.addShape(pptx.ShapeType.line, { x: 7.0, y: 2.0, w: 0.5, h: 0, line: { color: '000000', width: 2 } });

    const credsSlide = pptx.addSlide();
    credsSlide.addText('Demo Accounts', { x: 0.5, y: 0.5, fontSize: 28, bold: true });
    credsSlide.addText(
        [
            { text: 'Admin: admin@example.com / Admin#2025', options: { bullet: true } },
            { text: 'Teacher: teacher@example.com / Teacher#2025', options: { bullet: true } },
            { text: 'Student: student@example.com / Student#2025', options: { bullet: true } },
        ],
        { x: 0.5, y: 1.2, w: 9.0, fontSize: 18 }
    );

	const outPptx = path.join(outDir, 'Classroom_Overview.pptx');
	return pptx.writeFile({ fileName: outPptx });
}

function createPdf(outDir) {
	const doc = new PDFDocument({ size: 'A4', margin: 50 });
	const outPath = path.join(outDir, 'Classroom_Overview.pdf');
	const stream = fs.createWriteStream(outPath);
	doc.pipe(stream);

	// Title
	doc.fontSize(22).text('Classroom Management System', { align: 'left' });
	doc.moveDown(0.5).fontSize(12).fillColor('#666').text('Overview & Architecture');
	doc.moveDown(1).fillColor('#000');

	// Bullets
	doc.fontSize(14).text('Tech Stack', { underline: true });
	doc.fontSize(12).list([
		'Frontend: React, Vite, React Router, MUI',
		'API: Node.js, Express, Prisma, Zod, JWT',
		'Database: SQLite (dev) / PostgreSQL (prod)',
		'Services: Face service (Python), Admin panel (Django scaffold)'
	]);

	doc.moveDown(1);
	doc.fontSize(14).text('Key Features', { underline: true });
	doc.fontSize(12).list([
		'Authentication (JWT), role-based access',
		'Role dashboards: Student, Teacher, Admin',
		'Classes, Materials, Attendance routes',
		'Protected routes in frontend'
	]);

	// Simple diagram (boxes + arrows)
	doc.moveDown(1);
	doc.fontSize(14).text('Architecture (Simple Diagram)', { underline: true });
	const y = doc.y + 10;
	const box = (x, text, color) => {
		doc.save();
		doc.rect(x, y, 130, 50).fillAndStroke(color, '#333');
		doc.fillColor('#000').fontSize(10).text(text, x + 10, y + 18, { width: 110, align: 'center' });
		doc.restore();
	};
	box(50, 'Frontend\n(React + Vite)', '#DDEEFF');
	box(220, 'API\n(Express + Prisma)', '#E2F0D9');
	box(390, 'DB', '#FFF2CC');
	// Arrows
	doc.moveTo(180, y + 25).lineTo(220, y + 25).stroke();
	doc.moveTo(350, y + 25).lineTo(390, y + 25).stroke();

	// Demo creds
	doc.moveDown(5);
	doc.fontSize(14).text('Demo Accounts', { underline: true });
	doc.fontSize(12).list([
		'Admin: admin@example.com / Admin#2025',
		'Teacher: teacher@example.com / Teacher#2025',
		'Student: student@example.com / Student#2025'
	]);

	doc.end();
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve);
		stream.on('error', reject);
	});
}

async function main() {
	const outDir = path.join(__dirname, 'output');
	ensureDir(outDir);
	await createPptx(outDir);
	await createPdf(outDir);
	console.log('Generated docs in:', outDir);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});


