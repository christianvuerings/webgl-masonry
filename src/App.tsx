import * as THREE from "three";
import * as React from "react";
import { useRef, useState } from "react";
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
  extend,
} from "@react-three/fiber";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

extend({ TextGeometry });

import {
  ScrollControls,
  Scroll,
  OrthographicCamera,
  Html,
  RoundedBox,
} from "@react-three/drei";

/**
 * Helpful examples:
 * - https://threejs.org/examples/webgl_sprites.html - position sprites according to screen
 */

type BaseImage = {
  text: string;
  id: string;
  height: number;
  textHeight: number | null;
  width: number;
  url: string;
};
type ImageWithPosition = BaseImage & {
  position: [number, number, number];
};

const mindex = (arr: number[]) => arr.indexOf(Math.min(...arr));

function calculatePositions({
  images,
}: {
  images: BaseImage[];
}): ImageWithPosition[] {
  const gutter = 16;
  const columnWidth = 236;
  const columnWidthAndGutter = columnWidth + gutter;
  const containerWidth = window.innerWidth;

  const columnCount = Math.floor(
    (containerWidth + gutter) / columnWidthAndGutter,
  );
  const heights = new Array(columnCount).fill(0);

  const centerOffset = Math.max(
    Math.floor(
      (containerWidth - columnWidthAndGutter * columnCount + gutter) / 2,
    ),
    0,
  );

  return images.map((image) => {
    const { height, textHeight } = image;
    const col = mindex(heights);
    const top = heights[col];
    const left = col * columnWidthAndGutter + centerOffset;

    heights[col] += height + gutter + textHeight + 40;

    return {
      ...image,
      position: [
        left - window.innerWidth / 2,
        -top + window.innerHeight / 2,
        1,
      ],
    };
  });
}

function Loader(props: JSX.IntrinsicElements["mesh"]) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    ref.current.rotation.x += 0.01;
    ref.current.rotation.y += 0.01;
    ref.current.rotation.z += 0.01;
    if (ref.current.scale.x < 2) {
      ref.current.scale.set(
        (ref.current.scale.x += 0.001),
        (ref.current.scale.y += 0.001),
        (ref.current.scale.z += 0.001),
      );
    }
  });

  return (
    <mesh
      {...props}
      ref={ref}
      scale={0.5}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "#222" : "#e60023"} />
    </mesh>
  );
}

function Item({
  text,
  height,
  width,
  url,
  position,
}: {
  text: string;
  height: number;
  width: number;
  url: string;
  position: [number, number, number];
}) {
  const texture = useLoader(THREE.TextureLoader, url);
  const [textHeight, setTextHeight] = useState(0);

  const textRef = React.useCallback((node: HTMLDivElement) => {
    if (node !== null && text) {
      setTextHeight(node.getBoundingClientRect().height);
    }
  }, []);

  // console.log(textHeight, text);

  const textHorizontalPadding = 6;
  const textVerticalTopPadding = 8;

  return (
    <>
      <group
        position={[
          position[0] + textHorizontalPadding,
          position[1] - height - textVerticalTopPadding,
          position[2],
        ]}
      >
        <TextNode width={width} text={text} />
      </group>

      <sprite
        position={position}
        scale={[width, height, 1]}
        center={[0, 1]}
        // Ensure that images still render when they are near the edge of the screen
        frustumCulled={false}
      >
        <spriteMaterial map={texture} attach="material" />
      </sprite>
      {/*
      <RoundedBox args={position} radius={0.1} smoothness={4}>
        <meshPhongMaterial color="#000000" wireframe />
      </RoundedBox> */}
    </>
  );
}

const TextNode = React.forwardRef<
  HTMLDivElement,
  { text: string; width: number }
>(({ text, width }, ref) => {
  const textHorizontalPadding = 6;
  return (
    <Html zIndexRange={[0, 0]}>
      <div
        ref={ref}
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Helvetica, 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
          // Antialiasing
          MozOsxFontSmoothing: "grayscale",
          WebkitFontSmoothing: "antialiased",
          // Line clamping
          display: "-webkit-Box",
          overflow: "hidden",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          // Bold
          fontWeight: 600,
          // Width
          width: width - textHorizontalPadding * 2,
        }}
      >
        {text}
      </div>
    </Html>
  );
});

function MeasureTextNode({
  setImages,
  width,
  text,
  index,
}: {
  width: number;
  text: string;
  index: number;
  setImages: (images: BaseImage[]) => void;
}) {
  const textRef = React.useCallback((node: HTMLDivElement) => {
    if (node == null) {
      return;
    }

    const textHeight = text ? node.getBoundingClientRect().height : 0;
    console.log({ textHeight });

    setImages((images) => {
      return images.map((image, i) => {
        if (i === index && image.textHeight === null) {
          return {
            ...image,
            textHeight,
          };
        }
        return image;
      });
    });
  }, []);

  return (
    <group position={[1148, -100, 1]}>
      <TextNode text={text} width={width} ref={textRef} />
    </group>
  );
}

function Items({ images }: { images: BaseImage[] }) {
  const { camera } = useThree();
  // console.log(camera.position.z);
  // camera.scale.set(1, 1, 1);
  camera.lookAt(0, 0, 0);
  // camera.position.setZ(4);
  const cornerVec = new THREE.Vector3(-1, 1, 0);
  // console.log({ x: cornerVec.x, y: cornerVec.y });
  cornerVec.unproject(camera);
  // console.log({ x: cornerVec.x, y: cornerVec.y });

  // const imagesWithPositions = useImagePositions({ images });

  return (
    <ScrollControls damping={100000} pages={100} distance={1}>
      <Scroll>
        <>
          {calculatePositions({ images }).map(
            ({ text, id, height, width, url, position }) => (
              <React.Suspense fallback={null} key={id}>
                <Item
                  key={id}
                  text={text}
                  height={height}
                  width={width}
                  url={url}
                  position={position}
                />
              </React.Suspense>
            ),
          )}
        </>
      </Scroll>
    </ScrollControls>
  );
}

function Masonry() {
  const [images, setImages] = useState<BaseImage[]>([]);

  const devAccessToken =
    "MTQzMTU5NDoyMDcwMjUwNTE1MjkxMTkyNDU6OTIyMzM3MjAzNjg1NDc3NTgwNzoxfDE2NjM1NTQ0ODM6MjY3ODQwMC0tMzdlOTc3YTAyZjFmNjhlNjY0MzkxY2I4ZTFhNjc4YmM=";

  // const searchUrl = `/api/v3/search/pins/?${new URLSearchParams({
  //   query: "golden retriever",
  //   fields: "image,pin.title,pin.description",
  //   access_token: devAccessToken,
  // }).toString()}`;
  const boardUrl = `api/v3/boards/207024982809674537/pins/?${new URLSearchParams(
    {
      access_token: devAccessToken,
      page_size: "250",
    },
  ).toString()}`;

  React.useEffect(() => {
    fetch(boardUrl, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then(
        ({
          data,
        }: {
          data: [
            {
              title: string;
              description: string;
              id: string;
              image_medium_size_pixels: {
                width: number;
                height: number;
              };
              image_medium_url: string;
              type: string;
            },
          ];
        }) => {
          setImages(
            [...data, ...data, ...data, ...data, ...data, ...data]
              ?.filter(({ type }) => type === "pin")
              .map(
                ({
                  title,
                  description,
                  id,
                  image_medium_size_pixels,
                  image_medium_url,
                }) => ({
                  text: title?.trim() || description?.trim(),
                  id,
                  height:
                    (image_medium_size_pixels?.height /
                      image_medium_size_pixels?.width) *
                    236,
                  width: 236,
                  url: image_medium_url.replace(
                    "https://i.pinimg.com/",
                    "/image/",
                  ),
                  textHeight: null,
                }),
              ),
          );
        },
      );
  }, []);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const imagesWithoutTextHeight = images.filter(
    ({ textHeight }) => textHeight === null,
  );

  return (
    <Canvas dpr={[1, 2]}>
      {/* <primitive object={new THREE.AxesHelper(10)} /> */}

      {images.length === 0 && (
        <>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Loader position={[0, 0, 0]} />
        </>
      )}

      <>
        {imagesWithoutTextHeight.length > 0
          ? images.map(({ text, id, url }, index) => (
              <React.Suspense fallback={null} key={id}>
                <MeasureTextNode
                  images={images}
                  setImages={setImages}
                  index={index}
                  width={width}
                  text={text}
                />
              </React.Suspense>
            ))
          : null}
      </>
      {/*
      <>
        {images.map(({ text, id, url }, index) => (
          <React.Suspense fallback={null} key={id}>
            <MeasureTextNode
              images={images}
              setImages={setImages}
              index={index}
              width={width}
              text={text}
            />
          </React.Suspense>
        ))}
      </> */}

      {imagesWithoutTextHeight.length === 0 && (
        <>
          <OrthographicCamera
            makeDefault
            zoom={1}
            left={-width / 2}
            right={width / 2}
            top={height / 2}
            bottom={-height / 2}
            near={1}
            far={100}
            position={[0, 0, 10]}
          />
          <Items images={images}></Items>
        </>
      )}
    </Canvas>
  );
}

export default function App() {
  return <Masonry />;
}
