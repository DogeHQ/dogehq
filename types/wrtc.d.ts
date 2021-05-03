/* eslint-disable @typescript-eslint/naming-convention */
declare module 'wrtc' {
	const wrtc: {
		MediaStream: MediaStream;
		MediaStreamTrack: MediaStreamTrack;
		RTCDataChannel: RTCDataChannel;
		RTCDataChannelEvent: RTCDataChannelEvent;
		RTCDtlsTransport: RTCDtlsTransport;
		RTCIceCandidate: RTCIceCandidate;
		RTCIceTransport: RTCIceTransport;
		RTCPeerConnection: RTCPeerConnection;
		RTCPeerConnectionIceEvent: RTCPeerConnectionIceEvent;
		RTCRtpReceiver: RTCRtpReceiver;
		RTCRtpSender: RTCRtpSender;
		RTCRtpTransceiver: RTCRtpTransceiver;
		RTCSctpTransport: RTCSctpTransport;
		RTCSessionDescription: RTCSessionDescription;
		getUserMedia: any;
		nonstandard: {
			i420ToRgba: any;
			RTCAudioSink: any;
			RTCAudioSource: any;
			RTCVideoSink: any;
			RTCVideoSource: any;
			rgbaToI420: any;
		};
	};

	export = wrtc;
}
