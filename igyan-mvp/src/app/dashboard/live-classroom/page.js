'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/utils/auth_context';

const API_BASE_URL = 'https://igyan-meets.onrender.com';
const WS_URL = 'wss://igyan-meets.onrender.com/ws';
const API_KEY = 'zQgLY2TzzmgKA0Ge98sTWYaWkxfz3b1ltV_rcUqHSDw';

function LiveClassroomContent() {
	const { user, authLoading } = useAuth();
	const searchParams = useSearchParams();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [roomName, setRoomName] = useState('');
	const [joinRoomId, setJoinRoomId] = useState('');
	const [inMeeting, setInMeeting] = useState(false);
	const [currentRoomId, setCurrentRoomId] = useState(null);
	const [isCreatingRoom, setIsCreatingRoom] = useState(false);
	const [roomError, setRoomError] = useState(null);

	const allowedRoles = ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'];

	// Auto-join if room ID is in URL
	useEffect(() => {
		if (!authLoading && user && !inMeeting) {
			const roomFromUrl = searchParams.get('join');
			if (roomFromUrl) {
				setCurrentRoomId(roomFromUrl);
				setInMeeting(true);
			}
		}
	}, [authLoading, user, searchParams, inMeeting]);

	if (authLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
			</div>
		);
	}

	if (!user || !allowedRoles.includes(user.role)) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
					<p className="text-gray-600">You don&apos;t have permission to access this feature.</p>
				</div>
			</div>
		);
	}

	const handleCreateMeeting = async () => {
		if (roomName.trim()) {
			setIsCreatingRoom(true);
			setRoomError(null);
			
			try {
				const roomId = roomName.trim().toLowerCase().replace(/\s+/g, '-');
				
				// Create room via API
				const response = await fetch(`${API_BASE_URL}/api/rooms`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-API-Key': API_KEY
					},
					body: JSON.stringify({
						room_code: roomId,
						name: roomName.trim(),
						created_by: user?.id || 'guest',
						max_participants: 50
					})
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.detail || 'Failed to create room');
				}

				const roomData = await response.json();
				console.log('✅ Room created:', roomData);
				
				setCurrentRoomId(roomId);
				setInMeeting(true);
				setShowCreateModal(false);
			} catch (error) {
				console.error('❌ Failed to create room:', error);
				setRoomError(error.message || 'Failed to create meeting. Please try again.');
			} finally {
				setIsCreatingRoom(false);
			}
		}
	};

	const handleJoinMeeting = async () => {
		if (joinRoomId.trim()) {
			setIsCreatingRoom(true);
			setRoomError(null);
			
			try {
				const roomId = joinRoomId.trim().toLowerCase();
				
				// Verify room exists via API
				const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
					headers: {
						'X-API-Key': API_KEY
					}
				});

				if (!response.ok) {
					if (response.status === 404) {
						throw new Error('Room not found. Please check the room code.');
					}
					throw new Error('Failed to verify room');
				}

				const roomData = await response.json();
				console.log('✅ Room verified:', roomData);
				
				setCurrentRoomId(roomId);
				setInMeeting(true);
				setShowJoinModal(false);
			} catch (error) {
				console.error('❌ Failed to join room:', error);
				setRoomError(error.message || 'Failed to join meeting. Please check the room code.');
			} finally {
				setIsCreatingRoom(false);
			}
		}
	};

	const handleLeaveMeeting = async () => {
		// Optionally delete room if user created it
		// For now, just leave the meeting
		setInMeeting(false);
		setCurrentRoomId(null);
		setRoomName('');
		setJoinRoomId('');
		setRoomError(null);
	};

	if (inMeeting && currentRoomId) {
		return <VideoConference roomId={currentRoomId} onLeave={handleLeaveMeeting} user={user} />;
	}

	return (
		<div className="p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center gap-3 mb-2">
					<Image src="/asset/imeets.png" alt="i-Meet" width={52} height={52} className="object-contain" />
					<h1 className="text-3xl font-bold">i-Meet Video Conferencing</h1>
				</div>
				<p className="text-gray-600 mb-8">Connect with your team through high-quality video calls</p>

				<div className="grid md:grid-cols-2 gap-6">
					<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
						<div className="text-5xl mb-4">🎥</div>
						<h2 className="text-2xl font-bold mb-3">Create Meeting</h2>
						<p className="text-gray-600 mb-6">Start a new video conference and invite others to join</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
						>
							Create New Meeting
						</button>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
						<div className="text-5xl mb-4">📱</div>
						<h2 className="text-2xl font-bold mb-3">Join Meeting</h2>
						<p className="text-gray-600 mb-6">Enter a meeting code to join an existing conference</p>
						<button
							onClick={() => setShowJoinModal(true)}
							className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
						>
							Join Existing Meeting
						</button>
					</div>
				</div>
			</div>

			{showCreateModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
						<h3 className="text-2xl font-bold mb-4">Create New Meeting</h3>
						{roomError && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{roomError}
							</div>
						)}
						<input
							type="text"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder="Enter meeting name..."
							className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
							onKeyPress={(e) => e.key === 'Enter' && !isCreatingRoom && handleCreateMeeting()}
							disabled={isCreatingRoom}
						/>
						<div className="flex gap-3">
							<button
								onClick={handleCreateMeeting}
								disabled={isCreatingRoom}
								className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isCreatingRoom ? 'Creating...' : 'Create'}
							</button>
							<button
								onClick={() => {
									setShowCreateModal(false);
									setRoomError(null);
								}}
								disabled={isCreatingRoom}
								className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg disabled:opacity-50"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showJoinModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
						<h3 className="text-2xl font-bold mb-4">Join Meeting</h3>
						{roomError && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{roomError}
							</div>
						)}
						<input
							type="text"
							value={joinRoomId}
							onChange={(e) => setJoinRoomId(e.target.value)}
							placeholder="Enter meeting code..."
							className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
							onKeyPress={(e) => e.key === 'Enter' && !isCreatingRoom && handleJoinMeeting()}
							disabled={isCreatingRoom}
						/>
						<div className="flex gap-3">
							<button
								onClick={handleJoinMeeting}
								disabled={isCreatingRoom}
								className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isCreatingRoom ? 'Joining...' : 'Join'}
							</button>
							<button
								onClick={() => {
									setShowJoinModal(false);
									setRoomError(null);
								}}
								disabled={isCreatingRoom}
								className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg disabled:opacity-50"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function LiveClassroom() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading classroom...</p>
				</div>
			</div>
		}>
			<LiveClassroomContent />
		</Suspense>
	);
}

function VideoConference({ roomId, onLeave, user }) {
	const [peers, setPeers] = useState({});
	const [isAudioEnabled, setIsAudioEnabled] = useState(true);
	const [isVideoEnabled, setIsVideoEnabled] = useState(true);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const [chatMessages, setChatMessages] = useState([]);
	const [chatInput, setChatInput] = useState('');
	const [showChat, setShowChat] = useState(false);
	const [error, setError] = useState(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [isConnected, setIsConnected] = useState(false);
	const [showCopyNotification, setShowCopyNotification] = useState(false);
	const [userId] = useState(() => user?.id || `guest-${Date.now()}`);

	const localVideoRef = useRef(null);
	const localStreamRef = useRef(null);
	const wsRef = useRef(null);
	const peerConnectionsRef = useRef({});
	const screenStreamRef = useRef(null);

	const displayName = user?.name || 'Guest';

	const cleanup = useCallback(() => {
		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach(track => track.stop());
		}
		if (screenStreamRef.current) {
			screenStreamRef.current.getTracks().forEach(track => track.stop());
		}
		Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
		if (wsRef.current) {
			wsRef.current.close();
		}
	}, []);

	const createPeerConnection = useCallback(async (peerId, peerName, createOffer = false) => {
		const config = {
			iceServers: [
				{ urls: 'stun:stun.l.google.com:19302' },
				{ urls: 'stun:stun1.l.google.com:19302' }
			]
		};

		const peerConnection = new RTCPeerConnection(config);
		peerConnectionsRef.current[peerId] = peerConnection;

		if (localStreamRef.current) {
			localStreamRef.current.getTracks().forEach(track => {
				peerConnection.addTrack(track, localStreamRef.current);
			});
		}

		peerConnection.ontrack = (event) => {
			setPeers(prev => ({
				...prev,
				[peerId]: {
					name: peerName,
					stream: event.streams[0]
				}
			}));
		};

		peerConnection.onicecandidate = (event) => {
			if (event.candidate && wsRef.current) {
				wsRef.current.send(JSON.stringify({
					type: 'ice-candidate',
					candidate: event.candidate,
					to: peerId
				}));
			}
		};

		if (createOffer) {
			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);
			
			wsRef.current.send(JSON.stringify({
				type: 'offer',
				offer: offer,
				to: peerId
			}));
		}

		return peerConnection;
	}, []);

	const handleSignalingMessage = useCallback(async (message) => {
		switch (message.type) {
			case 'user-joined':
				await createPeerConnection(message.userId, message.displayName, true);
				break;
			
			case 'user-left':
				if (peerConnectionsRef.current[message.userId]) {
					peerConnectionsRef.current[message.userId].close();
					delete peerConnectionsRef.current[message.userId];
				}
				setPeers(prev => {
					const newPeers = { ...prev };
					delete newPeers[message.userId];
					return newPeers;
				});
				break;
			
			case 'offer':
				const pc = await createPeerConnection(message.from, message.displayName, false);
				await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				wsRef.current.send(JSON.stringify({
					type: 'answer',
					answer: answer,
					to: message.from
				}));
				break;
			
			case 'answer':
				const peerConn = peerConnectionsRef.current[message.from];
				if (peerConn) {
					await peerConn.setRemoteDescription(new RTCSessionDescription(message.answer));
				}
				break;
			
			case 'ice-candidate':
				const conn = peerConnectionsRef.current[message.from];
				if (conn && message.candidate) {
					await conn.addIceCandidate(new RTCIceCandidate(message.candidate));
				}
				break;
			
			case 'chat':
				setChatMessages(prev => [...prev, {
					from: message.from,
					text: message.text,
					timestamp: new Date()
				}]);
				break;
		}
	}, [createPeerConnection]);

	const connectToSignalingServer = useCallback(() => {
		console.log('🔗 Connecting to:', `${WS_URL}?room=${roomId}`);
		
		try {
			const ws = new WebSocket(`${WS_URL}?room=${roomId}&userId=${userId}&name=${encodeURIComponent(displayName)}&apiKey=${API_KEY}`);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log('✅ Connected to signaling server');
				setIsConnected(true);
				ws.send(JSON.stringify({
					type: 'join',
					roomId,
					userId,
					displayName
				}));
			};

			ws.onmessage = async (event) => {
				const message = JSON.parse(event.data);
				console.log('📨 Message:', message.type);
				await handleSignalingMessage(message);
			};

			ws.onerror = (err) => {
				console.error('❌ WebSocket error:', err);
				setIsConnected(false);
			};

			ws.onclose = (event) => {
				console.log('🔌 Disconnected:', event.code);
				setIsConnected(false);
			};
		} catch (err) {
			console.error('❌ Connection failed:', err);
			setIsConnected(false);
		}
	}, [roomId, userId, displayName, handleSignalingMessage]);

	const initializeMedia = useCallback(async () => {
		try {
			setIsInitializing(true);
			console.log('🎥 Requesting camera and microphone access...');
			
			// Check if mediaDevices is available
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error('Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Edge.');
			}
			
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { 
					width: { ideal: 1280 },
					height: { ideal: 720 }
				},
				audio: {
					echoCancellation: true,
					noiseSuppression: true
				}
			});
			
			console.log('✅ Media access granted!');
			localStreamRef.current = stream;
			if (localVideoRef.current) {
				localVideoRef.current.srcObject = stream;
			}
			setIsInitializing(false);
			connectToSignalingServer();
		} catch (err) {
			console.error('❌ Media error details:', {
				name: err.name,
				message: err.message,
				constraint: err.constraint
			});
			setIsInitializing(false);
			
			if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
				setError('Camera/Microphone permission denied. Click the camera icon in your browser address bar to allow access, then refresh the page.');
			} else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
				setError('No camera or microphone found. Please connect a device and try again.');
			} else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
				setError('Camera/Microphone is busy. Retrying...');
				console.log('🔄 Camera busy, retrying with basic settings...');
				
				// Wait a moment and retry with basic constraints
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true
					});
					console.log('✅ Retry successful!');
					localStreamRef.current = stream;
					if (localVideoRef.current) {
						localVideoRef.current.srcObject = stream;
					}
					setError(null);
					setIsInitializing(false);
					connectToSignalingServer();
					return;
				} catch (retryErr) {
					console.error('❌ Retry failed:', retryErr);
					setError('Camera is busy or locked. Try: 1) Close all browser tabs 2) Restart your browser 3) Check Task Manager for apps using camera');
				}
			} else if (err.name === 'OverconstrainedError') {
				setError('Camera does not support the requested quality. Trying again with lower quality...');
				// Retry with lower constraints
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true
					});
					localStreamRef.current = stream;
					if (localVideoRef.current) {
						localVideoRef.current.srcObject = stream;
					}
					setError(null);
					setIsInitializing(false);
					connectToSignalingServer();
					return;
				} catch (retryErr) {
					console.error('Retry failed:', retryErr);
					setError('Could not access camera/microphone even with basic settings.');
				}
			} else {
				setError(`Error: ${err.message || 'Could not access camera/microphone. Please check your browser settings and ensure no other application is using your camera.'}`);
			}
		}
	}, [connectToSignalingServer]);

	useEffect(() => {
		initializeMedia();
		return () => cleanup();
	}, [initializeMedia, cleanup]);

	const toggleAudio = () => {
		if (localStreamRef.current) {
			const audioTrack = localStreamRef.current.getAudioTracks()[0];
			if (audioTrack) {
				audioTrack.enabled = !audioTrack.enabled;
				setIsAudioEnabled(audioTrack.enabled);
			}
		}
	};

	const toggleVideo = () => {
		if (localStreamRef.current) {
			const videoTrack = localStreamRef.current.getVideoTracks()[0];
			if (videoTrack) {
				videoTrack.enabled = !videoTrack.enabled;
				setIsVideoEnabled(videoTrack.enabled);
			}
		}
	};

	const toggleScreenShare = async () => {
		if (isScreenSharing) {
			if (screenStreamRef.current) {
				screenStreamRef.current.getTracks().forEach(track => track.stop());
				screenStreamRef.current = null;
			}
			
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			const videoTrack = stream.getVideoTracks()[0];
			
			Object.values(peerConnectionsRef.current).forEach(pc => {
				const sender = pc.getSenders().find(s => s.track?.kind === 'video');
				if (sender) sender.replaceTrack(videoTrack);
			});
			
			if (localVideoRef.current) {
				localVideoRef.current.srcObject = localStreamRef.current;
			}
			
			setIsScreenSharing(false);
		} else {
			try {
				const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
				screenStreamRef.current = screenStream;
				const screenTrack = screenStream.getVideoTracks()[0];
				
				Object.values(peerConnectionsRef.current).forEach(pc => {
					const sender = pc.getSenders().find(s => s.track?.kind === 'video');
					if (sender) sender.replaceTrack(screenTrack);
				});
				
				if (localVideoRef.current) {
					localVideoRef.current.srcObject = screenStream;
				}
				
				setIsScreenSharing(true);
				screenTrack.onended = () => toggleScreenShare();
			} catch (err) {
				console.error('Screen share error:', err);
			}
		}
	};

	const sendChatMessage = () => {
		if (chatInput.trim() && wsRef.current) {
			wsRef.current.send(JSON.stringify({
				type: 'chat',
				text: chatInput,
				from: displayName
			}));
			setChatMessages(prev => [...prev, {
				from: 'You',
				text: chatInput,
				timestamp: new Date()
			}]);
			setChatInput('');
		}
	};

	const handleLeave = () => {
		cleanup();
		onLeave();
	};

	const copyMeetingLink = () => {
		const meetingUrl = `${window.location.origin}/dashboard/live-classroom?join=${roomId}`;
		navigator.clipboard.writeText(meetingUrl).then(() => {
			setShowCopyNotification(true);
			setTimeout(() => setShowCopyNotification(false), 3000);
		}).catch(err => {
			console.error('Failed to copy:', err);
			alert(`Meeting Link: ${meetingUrl}`);
		});
	};

	if (isInitializing) {
		return (
			<div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
				<p className="text-white text-xl mb-2">Setting up your camera and microphone...</p>
				<p className="text-gray-400 text-sm">Please allow permissions when prompted</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
				<div className="text-center max-w-md px-6">
					<div className="text-6xl mb-4">🎥</div>
					<p className="text-red-500 text-xl mb-2 font-semibold">Permission Required</p>
					<p className="text-gray-300 mb-6">{error}</p>
					<div className="flex gap-3 justify-center">
						<button
							onClick={() => {
								setError(null);
								setIsInitializing(true);
								setTimeout(() => initializeMedia(), 500);
							}}
							className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium"
						>
							Try Again
						</button>
						<button
							onClick={handleLeave}
							className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	const totalParticipants = Object.keys(peers).length + 1;
	const gridCols = totalParticipants === 1 ? 'grid-cols-1' : 
					totalParticipants === 2 ? 'grid-cols-2' :
					totalParticipants <= 4 ? 'grid-cols-2' : 'grid-cols-3';

	return (
		<div className="fixed inset-0 bg-black z-50 flex flex-col">
			<div className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700">
				<div className="flex items-center gap-4">
					<div>
						<h2 className="text-xl font-semibold text-white">Room: {roomId}</h2>
						<p className="text-sm text-gray-400">
							{totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
							{!isConnected && <span className="ml-2 text-yellow-400">(Connecting...)</span>}
						</p>
					</div>
					<button
						onClick={copyMeetingLink}
						className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
						title="Copy meeting link to share with others"
					>
						🔗 Copy Link
					</button>
					{showCopyNotification && (
						<span className="text-green-400 text-sm font-medium animate-pulse">✓ Link copied!</span>
					)}
				</div>
				<button
					onClick={handleLeave}
					className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
				>
					Leave Meeting
				</button>
			</div>

			<div className="flex-1 p-4 overflow-auto">
				<div className={`grid ${gridCols} gap-4 h-full`}>
					<div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
						<video
							ref={localVideoRef}
							autoPlay
							muted
							playsInline
							className="w-full h-full object-cover"
						/>
						<div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-sm text-white font-medium">
							{displayName} (You)
						</div>
						<div className="absolute top-4 right-4">
							<div className="flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full text-xs text-white">
								<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
								{isConnected ? 'Connected' : 'Connecting...'}
							</div>
						</div>
						{!isVideoEnabled && (
							<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
								<div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-3xl font-bold text-white">
									{displayName.charAt(0).toUpperCase()}
								</div>
							</div>
						)}
					</div>

					{Object.entries(peers).map(([peerId, peer]) => (
						<RemoteVideo key={peerId} peer={peer} />
					))}
				</div>
			</div>

			<div className="bg-gray-900 px-6 py-4 flex items-center justify-center gap-4">
				<button
					onClick={toggleAudio}
					className={`p-4 rounded-full text-2xl ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
					title={isAudioEnabled ? 'Mute' : 'Unmute'}
				>
					{isAudioEnabled ? '🎤' : '🔇'}
				</button>
				
				<button
					onClick={toggleVideo}
					className={`p-4 rounded-full text-2xl ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
					title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
				>
					{isVideoEnabled ? '📹' : '📷'}
				</button>
				
				<button
					onClick={toggleScreenShare}
					className={`p-4 rounded-full text-2xl ${isScreenSharing ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
					title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
				>
					🖥️
				</button>
				
				<button
					onClick={() => setShowChat(!showChat)}
					className="p-4 rounded-full text-2xl bg-gray-700 hover:bg-gray-600"
					title="Toggle chat"
				>
					💬
				</button>
			</div>

			{showChat && (
				<div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
					<div className="p-4 border-b border-gray-700">
						<h3 className="font-semibold text-white">Chat</h3>
					</div>
					<div className="flex-1 overflow-y-auto p-4 space-y-2">
						{chatMessages.map((msg, idx) => (
							<div key={idx} className="bg-gray-800 rounded-lg p-2">
								<p className="text-xs text-gray-400">{msg.from}</p>
								<p className="text-sm text-white">{msg.text}</p>
							</div>
						))}
					</div>
					<div className="p-4 border-t border-gray-700 flex gap-2">
						<input
							type="text"
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
							placeholder="Type a message..."
							className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white"
						/>
						<button
							onClick={sendChatMessage}
							className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white"
						>
							Send
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

function RemoteVideo({ peer }) {
	const videoRef = useRef(null);

	useEffect(() => {
		if (videoRef.current && peer.stream) {
			videoRef.current.srcObject = peer.stream;
		}
	}, [peer.stream]);

	return (
		<div className="relative bg-gray-800 rounded-lg overflow-hidden">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				className="w-full h-full object-cover"
			/>
			<div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-sm text-white">
				{peer.name}
			</div>
		</div>
	);
}
