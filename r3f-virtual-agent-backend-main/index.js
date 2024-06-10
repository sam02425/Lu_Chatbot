import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { Server } from "socket.io";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-",
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "kgG7dCoKCfLehAPWkJOE";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// Set up Socket.io
const server = app.listen(port, () => {
  console.log(`Virtual Agent listening on port ${port}`);
});
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with the appropriate origin or origins
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

let presentationInterval; // Declare presentationInterval at the top level
let sections;
let presentationRunning = true; // Declare and initialize presentationRunning here
let currentSectionIndex = 0;

const initializeSections = async () => {
 sections = {
  intro: {
    text: "Welcome to Lamar University, where dreams take flight and opportunities abound. As a proud member of the Texas State University System, we invite you to discover a world of academic excellence, groundbreaking research, and unwavering community spirit. Step onto our vibrant campus in the heart of Southeast Texas, and experience a transformative education that will unleash your full potential. At Lamar University, we don't just teach; we inspire, challenge, and empower you to make your mark on the world.",
    audio: "audios/1.Lu_Intro.wav",
    lipsync: await readJsonTranscript("audios/1.Lu_Intro.json"),
    facialExpression: "smile",
    animation: "Talking1",
  },
  academics: {
    text: "Embark on an academic journey like no other at Lamar University. Our comprehensive range of programs spans the arts, sciences, business, engineering, and beyond, providing endless opportunities to explore your passions and chart your path to success. With our distinguished faculty as your guides, you'll delve into the depths of knowledge, ignite your curiosity, and develop the skills to thrive in an ever-changing world. Whether you envision yourself as a creative visionary, a pioneering researcher, or a business leader, Lamar University is where your journey begins.",
    audio: "audios/2.Lu_Acade.wav",
    lipsync: await readJsonTranscript("audios/2.Lu_Acade.json"),
    facialExpression: "smile",
    animation: "Talking1",
  },
  campusLife: {
    text: "Get ready to immerse yourself in the vibrant tapestry of campus life at Lamar University! From the moment you arrive, you'll find yourself surrounded by a community that feels like family. Join student organizations, attend thrilling athletic events, and participate in a kaleidoscope of cultural experiences. Our state-of-the-art facilities, including cutting-edge labs and inspiring spaces, provide the perfect backdrop for your growth and discovery. At Lamar University, every day brings new adventures and opportunities to create lifelong memories.",
    audio: "audios/3.Lu_Campus.wav",
    lipsync: await readJsonTranscript("audios/3.Lu_Campus.json"),
    facialExpression: "smile",
    animation: "Talking2",
  },
  researchInnovation: {
    text: "At Lamar University, we believe that research and innovation hold the key to a brighter future. Our faculty and students are at the forefront of groundbreaking discoveries, tackling real-world challenges head-on. With access to specialized research centers and industry partnerships, you'll have the opportunity to engage in hands-on, interdisciplinary projects that push the boundaries of knowledge. Whether you're driven by a passion for scientific breakthroughs, technological advancements, or creative endeavors, Lamar University is where you can make your mark and contribute to the progress of our world.",
    audio: "audios/4.Lu_Research.wav",
    lipsync: await readJsonTranscript("audios/4.Lu_Research.json"),
    facialExpression: "smile",
    animation: "Talking2",
  },
  communityEngagement: {
    text: "At Lamar University, we believe that true education extends beyond the classroom walls. We are deeply committed to fostering strong partnerships with our local community, working hand in hand to create positive change and address societal needs. Through service-learning projects, internships, and volunteer opportunities, you'll have the chance to apply your knowledge and skills to make a tangible difference in the lives of others. Join us in building bridges, strengthening our region, and shaping a better future for all.",
    audio: "audios/5.Lu_Community.wav",
    lipsync: await readJsonTranscript("audios/5.Lu_Community.json"),
    facialExpression: "smile",
    animation: "Talking3",
  },
  academicPrograms: {
    text: "Discover a world of academic possibilities at Lamar University. Our five colleges offer a wide array of programs designed to ignite your passion and propel you towards success. In the College of Arts and Sciences, you'll explore the depths of human creativity and scientific inquiry. The College of Business will equip you with the knowledge and entrepreneurial spirit to lead in today's competitive marketplace. Shape the minds of tomorrow in the College of Education and Human Development, or innovate and build the future in the College of Engineering. And in the College of Fine Arts and Communication, unleash your creativity and find your voice. No matter your path, Lamar University is where you'll find the support, resources, and inspiration to achieve your dreams.",
    audio: "audios/6.Lu_Aca_Prog.wav",
    lipsync: await readJsonTranscript("audios/6.Lu_Aca_Prog.json"),
    facialExpression: "smile",
    animation: "Talking1",
  },
  artsSciences: {
    text: "In the College of Arts and Sciences, we invite you to embark on a journey of discovery and exploration. Dive into the realm of natural sciences, where you'll unravel the mysteries of the universe and contribute to groundbreaking research. Immerse yourself in the beauty of the humanities, exploring the depths of literature, philosophy, and languages. Engage in the social sciences, understanding the complexities of human behavior and societal dynamics. With our expert faculty and cutting-edge facilities, you'll have the tools and support to pursue your passions and make a lasting impact in your chosen field.",
    audio: "audios/8.Lu_ArtSci.wav",
    lipsync: await readJsonTranscript("audios/8.Lu_ArtSci.json"),
    facialExpression: "smile",
    animation: "Talking2",
  },
  business: {
    text: "Welcome to the College of Business, where we shape the leaders of tomorrow. Our dynamic programs, rooted in real-world experience and industry connections, will equip you with the knowledge and skills to excel in the global marketplace. From accounting and finance to marketing and entrepreneurship, our curriculum is designed to help you navigate the ever-evolving business landscape. With hands-on learning opportunities, internships, and mentorship from seasoned professionals, you'll graduate ready to make your mark in the world of business.",
    audio: "audios/9.Lu_Busin.wav",
    lipsync: await readJsonTranscript("audios/9.Lu_Busin.json"),
    facialExpression: "smile",
    animation: "Talking1",
  },
  educationHumanDevelopment: {
    text: "In the College of Education and Human Development, we believe in the power of education to transform lives. Whether you aspire to be a passionate teacher, a dedicated counselor, or a visionary leader in education, our programs will provide you with the tools and expertise to make a difference. With a focus on experiential learning, cutting-edge research, and community engagement, you'll gain the skills and perspective to shape the future of education and positively impact the lives of others.",
    audio: "audios/10.Lu_EduHuman.wav",
    lipsync: await readJsonTranscript("audios/10.Lu_EduHuman.json"),
    facialExpression: "smile",
    animation: "Talking3",
  },
  engineering: {
    text: "Welcome to the College of Engineering, where innovation meets purpose. Our state-of-the-art facilities and industry-aligned curriculum will immerse you in the world of engineering, from the intricacies of computer science to the marvels of mechanical engineering. With a focus on hands-on learning, collaborative projects, and groundbreaking research, you'll have the opportunity to tackle real-world challenges and develop solutions that shape the future. Whether you envision yourself as a software pioneer, a sustainable energy innovator, or a robotics expert, the College of Engineering is where your ideas take flight.",
    audio: "audios/11.Lu_Eng.wav",
    lipsync: await readJsonTranscript("audios/11.Lu_Eng.json"),
    facialExpression: "smile",
    animation: "Talking3",
  },
  fineArtsCommunication: {
    text: "Step into a world of boundless creativity and expression in the College of Fine Arts and Communication. Whether your passion lies in the visual arts, music, theatre, or media, our programs will nurture your talents and help you find your unique voice. With state-of-the-art studios, performance spaces, and cutting-edge technology, you'll have the tools to bring your vision to life. Our faculty, renowned artists and practitioners in their fields, will guide you on a journey of artistic growth and self-discovery. Join a vibrant community of creators, communicators, and innovators, and let your imagination soar.",
    audio: "audios/12.Lu_FineArt.wav",
    lipsync: await readJsonTranscript("audios/12.Lu_FineArt.json"),
    facialExpression: "smile",
    animation: "Talking1",
  },
  academicEnd: {
    text: "No matter which path you choose, Lamar University's academic programs will provide you with the knowledge, skills, and inspiration to excel in your chosen field. With our dedicated faculty, state-of-the-art facilities, and commitment to excellence, you'll have the support and resources to turn your dreams into reality. Join us and discover the transformative power of education at Lamar University.",
    audio: "audios/13.Lu_Acc_end.wav",
    lipsync: await readJsonTranscript("audios/13.Lu_Acc_end.json"),
    facialExpression: "smile",
    animation: "Talking1",
  },
  joinUs: {
    text: "Join us at Lamar University, and embark on a transformative journey that will shape your future and the world around you. Together, let's create a brighter tomorrow. Welcome to the Cardinal family!",
    audio: "audios/7.Lu_Join.wav",
    lipsync: await readJsonTranscript("audios/7.Lu_Join.json"),
    facialExpression: "smile",
    animation: "Talking3",
  },
 };
};

const startServer = async () => {
  await initializeSections();
  presentationRunning = true; // Flag to track if the presentation should be running
let presentationInterval;
startPresentation();

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};


const presentNextSection = async () => {
  const sectionKeys = Object.keys(sections);
  const currentSection = sections[sectionKeys[currentSectionIndex]];

  return {
    text: currentSection.text,
    audio: await audioFileToBase64(currentSection.audio),
    lipsync: currentSection.lipsync,
    facialExpression: currentSection.facialExpression,
    animation: currentSection.animation,
  };
};

const startPresentation = async () => {
  clearInterval(presentationInterval);
  presentationInterval = setInterval(async () => {
    if (presentationRunning) {
      const message = await presentNextSection();
      currentSectionIndex = (currentSectionIndex + 1) % Object.keys(sections).length;

      // Send the message to the frontend using Socket.io
      io.emit("presentationMessage", message);
    }
  }, 5000);
};

const stopPresentation = () => {
  clearInterval(presentationInterval); // presentationInterval is defined
};

const startServer = async () => {
  await initializeSections();

  startPresentation();

io.on("connection", (socket) => {
  console.log("New client connected");

  // Verify if the client is receiving the presentation messages
  socket.on("presentationMessage", (message) => {
    console.log("Received presentationMessage event from client:", message);
  });

  socket.on("userMessage", async (userMessage) => {
    if (userMessage === "stop") {
      stopPresentation();
      socket.emit("presentationMessage", { text: "Presentation stopped." });
      return;
    }
    // User has asked a question
    let messages = [];

    // Check if the user asks about a specific section
    let foundInSection = false;
    for (const section in sections) {
      if (userMessage.toLowerCase().includes(section.toLowerCase())) {
        messages.push({
          text: sections[section].text,
          audio: await audioFileToBase64(sections[section].audio),
          lipsync: sections[section].lipsync,
          facialExpression: sections[section].facialExpression,
          animation: sections[section].animation,
        });
        foundInSection = true;
        break;
      }
    }

    if (!foundInSection) {
      // If the question is not found in the sections, use ChatGPT and ElevenLabs APIs
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          max_tokens: 1000,
          temperature: 0.6,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content: `
              You are a virtual assistant for Lamar University.
              You will always reply with a JSON array of messages. With a maximum of 1 message.
              Each message has a text, facialExpression, and animation property.
              The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
              The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry.
              `,
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        });

        let generatedMessages = JSON.parse(completion.choices[0].message.content);
        if (generatedMessages.messages) {
          generatedMessages = generatedMessages.messages;
        }

        for (let i = 0; i < generatedMessages.length; i++) {
          const message = generatedMessages[i];
          const fileName = `audios/message_${i}.mp3`;
          const textInput = message.text;
          await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
          await lipSyncMessage(i);
          message.audio = await audioFileToBase64(fileName);
          message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
        }

        messages = generatedMessages;
      } catch (error) {
        console.error("Error occurred while processing the request:", error);
        messages.push({
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "sad",
          animation: "Idle",
        });
      }
    }

    socket.emit("presentationMessage", messages[0]);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    stopPresentation(); // This line is causing the error
  });
});
};
startServer();
}
