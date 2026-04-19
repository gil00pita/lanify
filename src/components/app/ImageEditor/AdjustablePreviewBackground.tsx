import React from 'react';
import { CropperTransitions, CropperImage, CropperState, Size } from 'react-advanced-cropper';
import { getPreviewStyle } from 'advanced-cropper';
import { AdjustableImage } from './AdjustableImage';

interface DesiredCropperRef {
	getState: () => CropperState;
	getTransitions: () => CropperTransitions;
	getImage: () => CropperImage;
}

interface Props {
	cropper: DesiredCropperRef;
	crossOrigin?: 'anonymous' | 'use-credentials' | boolean;
	brightness?: number;
	saturation?: number;
	hue?: number;
	grayscale?: number;
	contrast?: number;
	outlineColor?: string;
	outlineWidth?: number;
	size?: Size | null;
}

export const AdjustablePreviewBackground = ({
	cropper,
	crossOrigin,
	brightness = 0,
	saturation = 0,
	hue = 0,
	grayscale = 0,
	contrast = 0,
	outlineColor,
	outlineWidth = 0,
	size,
}: Props) => {
	const state = cropper.getState();
	const transitions = cropper.getTransitions();
	const image = cropper.getImage();

	const style = image && state && size ? getPreviewStyle(image, state, size, transitions) : {};

	return (
		<AdjustableImage
			src={image?.src}
			crossOrigin={crossOrigin}
			brightness={brightness}
			saturation={saturation}
			hue={hue}
			grayscale={grayscale}
			contrast={contrast}
			outlineColor={outlineColor}
			outlineWidth={outlineWidth}
			style={style}
		/>
	);
};
