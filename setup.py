from setuptools import setup, find_packages

setup(
    name="aether-gesture",
    version="3.0.0",
    packages=find_packages(),
    install_requires=[
        'opencv-python',
        'mediapipe',
        'pyautogui',
        'numpy',
        'scikit-learn',
        'pycaw',
        'comtypes'
    ],
    entry_points={
        'console_scripts': [
            'aether=main:main',
        ],
    },
    author="Aether Team",
    description="A production-grade, intelligent gesture interaction platform.",
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url="https://github.com/harsh2055/HS",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.8',
)
