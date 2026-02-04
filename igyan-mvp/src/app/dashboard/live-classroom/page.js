'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/utils/auth_context';

const API_BASE_URL = 'https://igyan-meets.onrender.com';
const API_KEY = 'zQgLY2TzzmgKA0Ge98sTWYaWkxfz3b1ltV_rcUqHSDw';

function LiveClassroomContent() {
	const { user, authLoading } = useAuth();
	const searchParams = useSearchParams();
	const [inMeeting, setInMeeting] = useState(false);
	const [currentRoomId, setCurrentRoomId] = useState(null);
	const [useIframe, setUseIframe] = useState(true);

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

	// If in meeting, show the igyan-meets interface directly
	if (inMeeting && currentRoomId) {
		const meetingUrl = currentRoomId 
			? `${API_BASE_URL}/join/${currentRoomId}?name=${encodeURIComponent(user?.name || 'Guest')}&apiKey=${API_KEY}`
			: `${API_BASE_URL}/demo`;

		return (
			<div className="flex flex-col h-screen bg-black">
				<div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
					<div className="flex items-center gap-3">
						<Image src="/asset/imeets.png" alt="Omni Sight" width={40} height={40} className="object-contain" />
						<div>
							<h2 className="text-lg font-semibold text-white">Omni Sight - Room: {currentRoomId}</h2>
							<p className="text-xs text-gray-400">Powered by igyan-meets</p>
						</div>
					</div>
					<button
						onClick={() => {
							setInMeeting(false);
							setCurrentRoomId(null);
						}}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
					>
						Leave Meeting
					</button>
				</div>
				<div className="flex-1 overflow-hidden">
					<iframe
						src={meetingUrl}
						className="w-full h-full border-0"
						allow="camera; microphone; display-capture; fullscreen"
						title="Video Conference"
					/>
				</div>
			</div>
		);
	}

	// Main landing page - embedded igyan-meets demo
	return (
		<div className="flex flex-col h-screen">
			<div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 sm:px-6 py-4 shadow-lg flex-shrink-0">
				<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<Image src="/asset/imeets.png" alt="Omni Sight" width={48} height={48} className="object-contain" />
						<div>
							<h1 className="text-xl sm:text-2xl font-bold text-white">Omni Sight Video Conferencing</h1>
							<p className="text-purple-100 text-xs sm:text-sm">Powered by igyan-meets • Secure • Fast • Reliable</p>
						</div>
					</div>
					<button
						onClick={() => setUseIframe(!useIframe)}
						className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors backdrop-blur"
					>
						{useIframe ? '📱 Native View' : '🌐 Web View'}
					</button>
				</div>
			</div>
			
			<div className="flex-1 overflow-hidden">
				{useIframe ? (
					<iframe
						src={`${API_BASE_URL}/demo`}
						className="w-full h-full border-0 bg-white"
						allow="camera; microphone; display-capture; fullscreen"
						title="Omni Sight Video Conferencing"
					/>
				) : (
					<NativeInterface 
						onJoinMeeting={(roomId) => {
							setCurrentRoomId(roomId);
							setInMeeting(true);
						}}
						user={user}
					/>
				)}
			</div>
		</div>
	);
}

// Native interface component (optional fallback)
function NativeInterface({ onJoinMeeting, user }) {
	const [roomName, setRoomName] = useState('');
	const [joinRoomId, setJoinRoomId] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleCreateMeeting = async () => {
		if (!roomName.trim()) return;
		
		setIsLoading(true);
		setError(null);
		
		try {
			const roomId = roomName.trim().toLowerCase().replace(/\s+/g, '-');
			
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

			onJoinMeeting(roomId);
		} catch (err) {
			setError(err.message || 'Failed to create meeting');
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinMeeting = async () => {
		if (!joinRoomId.trim()) return;
		
		setIsLoading(true);
		setError(null);
		
		try {
			const roomId = joinRoomId.trim().toLowerCase();
			
			const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
				headers: { 'X-API-Key': API_KEY }
			});

			if (!response.ok && response.status !== 404) {
				throw new Error('Failed to verify room');
			}

			onJoinMeeting(roomId);
		} catch (err) {
			setError(err.message || 'Failed to join meeting');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 lg:p-8 overflow-auto">
			<div className="max-w-6xl mx-auto">
				{error && (
					<div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
						<p className="text-red-700 font-medium">⚠️ {error}</p>
					</div>
				)}

				<div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
					<div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-100 hover:shadow-2xl transition-shadow">
						<div className="text-5xl sm:text-6xl mb-4">🎥</div>
						<h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">Create Meeting</h2>
						<p className="text-sm sm:text-base text-gray-600 mb-6">Start a new video conference instantly</p>
						<input
							type="text"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder="Enter meeting name..."
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
							onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleCreateMeeting()}
							disabled={isLoading}
						/>
						<button
							onClick={handleCreateMeeting}
							disabled={isLoading || !roomName.trim()}
							className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm sm:text-base"
						>
							{isLoading ? '⏳ Creating...' : '🚀 Create New Meeting'}
						</button>
					</div>

					<div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-blue-100 hover:shadow-2xl transition-shadow">
						<div className="text-5xl sm:text-6xl mb-4">📱</div>
						<h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">Join Meeting</h2>
						<p className="text-sm sm:text-base text-gray-600 mb-6">Enter a meeting code to join</p>
						<input
							type="text"
							value={joinRoomId}
							onChange={(e) => setJoinRoomId(e.target.value)}
							placeholder="Enter meeting code..."
							className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
							onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleJoinMeeting()}
							disabled={isLoading}
						/>
						<button
							onClick={handleJoinMeeting}
							disabled={isLoading || !joinRoomId.trim()}
							className="w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm sm:text-base"
						>
							{isLoading ? '⏳ Joining...' : '🎯 Join Meeting'}
						</button>
					</div>
				</div>

				<div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
					<h3 className="text-base sm:text-lg font-bold mb-3 text-gray-800">✨ Features</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">🔒</span>
							<span className="text-sm sm:text-base text-gray-700">Secure & Private</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">⚡</span>
							<span className="text-sm sm:text-base text-gray-700">Fast & Reliable</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">💬</span>
							<span className="text-sm sm:text-base text-gray-700">Chat & Screen Share</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">🎙️</span>
							<span className="text-sm sm:text-base text-gray-700">HD Audio/Video</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">📹</span>
							<span className="text-sm sm:text-base text-gray-700">Recording Available</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-xl sm:text-2xl">🌐</span>
							<span className="text-sm sm:text-base text-gray-700">Works Everywhere</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function LiveClassroom() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-700 font-medium text-lg">Loading Omni Sight...</p>
				</div>
			</div>
		}>
			<LiveClassroomContent />
		</Suspense>
	);
}
